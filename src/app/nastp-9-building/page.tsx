"use client";

import React, { Suspense, useRef, useLayoutEffect, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  Drawer,
  DrawerContent,
  DrawerBody,
  useDisclosure,
} from "@heroui/react";
import THvacStatusIcon from "@/components/Icons/THvacStatusIcon";
import { useMideaStore } from "@/stores/useMideaStore";
import { Loader } from "lucide-react";
import chalk from "chalk";
import ACControlDrawer from "@/components/TACController";
import { HvacMideaDevice } from "@/types/midea-types";
import TWeatherForcasting from "@/components/TWeatherForcasting";
import { activeStatus, getActiveStatus, MideaRunModes } from "@/types/types";
import TWeatherForcastingWith3DModel from "@/components/TWeatherForcastingWith3DModel";


function FrameModel({ model }: { model: THREE.Object3D }) {
  const { camera, controls } = useThree();

  const modelRef = useRef<THREE.Object3D>(model);

  useLayoutEffect(() => {
    modelRef.current = model;
  }, [model]);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.z);

    if (camera instanceof THREE.PerspectiveCamera) {
      const fov = (camera.fov * Math.PI) / 180;
      const distance = (maxDim / 3) / Math.tan(fov / 2) * 1.0;
      
      // Position camera directly above the model (top-down view)
      camera.position.set(center.x + 2.5, center.y + distance + 1.2, center.z);
      camera.lookAt(center.x, center.y, center.z);
      
      camera.near = Math.max(0.5, distance / 100);
      camera.far = distance * 10;
      camera.updateProjectionMatrix();
    }

    if (controls && "target" in controls && "update" in controls) {
      (controls as OrbitControlsImpl).target.copy(center);
      (controls as OrbitControlsImpl).update();
    }

    // Center the model at origin (0, 0, 0)
    model.position.set(-center.x, -center.y, -center.z);
    
    // Keep rotation if needed
    // model.rotation.y = Math.PI / 1;

  }, [model, camera, controls]);

  return null;
}

function ModelContent({
  url,
  controlsRef,
  onOpenDrawer
}: {
  url: string;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  onOpenDrawer: (index: number, childName: string) => void;
}) {

  const {
    data,
    initSocket,
    isSocketLoading,
  } = useMideaStore();

  useEffect(() => {
    initSocket();    
  }, [initSocket]);
  
  // 3D modeling content
  const { scene } = useGLTF(url, true);

  const { camera } = useThree();

  const [, setActiveIndex] = useState<number | null>(null);
  const [hoveredUuid, setHoveredUuid] = useState<string | null>(null);

  const modelRef = useRef<THREE.Object3D>(scene);

  useLayoutEffect(() => {
    modelRef.current = scene;
  }, [scene]);

  const [childPositions, setChildPositions] = useState<
    { uuid: string; name: string; pos: [number, number, number]; index: number }[]
  >([]);

  useLayoutEffect(() => {
    if (!scene) return;
    scene.updateMatrixWorld(true);

    const topChildren = scene.children.map((c) => c.children).flat().filter(c => c.children.length > 0);

    const positions = topChildren.map((child, index) => {
      child.updateMatrixWorld(true);
      let worldVec = new THREE.Vector3();
      const mesh = child.getObjectByProperty("type", "Mesh") as THREE.Mesh | undefined;

      if (mesh) {
        mesh.updateWorldMatrix(true, false);
        const geom = mesh.geometry as THREE.BufferGeometry;
        if (geom) {
          if (!geom.boundingBox) geom.computeBoundingBox();
          const box = geom.boundingBox!.clone();
          const min = box.min.clone().applyMatrix4(mesh.matrixWorld);
          const max = box.max.clone().applyMatrix4(mesh.matrixWorld);
          worldVec = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
        } else mesh.getWorldPosition(worldVec);
      } else {
        child.getWorldPosition(worldVec);
      }

      return { 
        uuid: child.uuid, name: child.name || "", 
        pos: [worldVec.x, worldVec.y, worldVec.z] as [number, number, number], 
        index 
      };
    });

    setChildPositions(positions);
  }, [scene]);

  const handleClick = (pos: [number, number, number], index: number, name: string) => {
      if (!controlsRef.current) return;

      const targetVec = new THREE.Vector3(...pos);
      
      // Get camera's current direction but position at fixed distance from target
      const currentDir = new THREE.Vector3()
          .subVectors(camera.position, controlsRef.current.target)
          .normalize();
      
      // DISTANCE from target (adjust this value)
      const zoomDistance = 22.0; // Try 6-12 for good room overview
      
      camera.position.copy(targetVec.clone().add(currentDir.multiplyScalar(zoomDistance)));
      controlsRef.current.target.copy(targetVec);
      controlsRef.current.update();

      setActiveIndex(index);
      onOpenDrawer(index, name);
  };

  const handleOnZoomClick = (pos: [number, number, number], index: number) => {
      if (!controlsRef.current) return;

      const targetVec = new THREE.Vector3(...pos);
      
      // Get camera's current direction but position at fixed distance from target
      const currentDir = new THREE.Vector3()
          .subVectors(camera.position, controlsRef.current.target)
          .normalize();
      
      // DISTANCE from target (adjust this value)
      const zoomDistance = 22.0; // Try 6-12 for good room overview
      
      camera.position.copy(targetVec.clone().add(currentDir.multiplyScalar(zoomDistance)));
      controlsRef.current.target.copy(targetVec);
      controlsRef.current.update();

      setActiveIndex(index);
  };

  // In hotspotMeshes useMemo
  const hotspotMeshes = useMemo(() => {
      return childPositions.map((p) => {
        console.log(chalk.green(`Processing hotspot for ${JSON.stringify(p, null, 4)}`));

          const assignedName = data?.metadata.map(d => d.tenantRoom?.assigned_name === p.name ? d.deviceSn : null).filter(Boolean)[0] || `${p.name}: Unknown Room`;
          const temperature = data?.metadata.map(d => d.tenantRoom?.assigned_name === p.name ? d.set_temperature : null).filter(Boolean)[0] || 0;
          
          const newData = data?.metadata.map(d => d.tenantRoom?.assigned_name === p.name ? d : null).filter(Boolean)[0] || null;
          
          // Get the actual run mode from newData
          const currentRunMode = newData?.run_mode;
          const runModeBGColor = MideaRunModes.find(m => m.mode === currentRunMode)?.bg || '#27AE60'; // default to Auto
          
          // Map run_mode number to activeStatus string
          const activeStatus = getActiveStatus(currentRunMode as number);

          console.log(chalk.blue(`activeStatus for ${p.name}: ${activeStatus}`));

          return (
              <mesh
                  key={p.uuid}
                  position={p.pos as unknown as THREE.Vector3}
                  onPointerOver={(e) => { e.stopPropagation(); setHoveredUuid(p.uuid); document.body.style.cursor = "pointer"; }}
                  onPointerOut={() => { setHoveredUuid(null); document.body.style.cursor = "default"; }}
                  onClick={(e) => { 
                      e.stopPropagation(); 
                      handleOnZoomClick(p.pos, p.index);  // Your existing zoom function
                  }}
              >
                  {/* <sphereGeometry args={[0.85, 100, 100]} /> */}

                  {/* Rectangle with hover */}
                  <boxGeometry 
                    args={[2.3, 3.6, 1.6]}
                  />

                  <meshBasicMaterial
                    color={hoveredUuid === p.uuid ? "" : "blue"}
                    transparent={true}
                    opacity={hoveredUuid === p.uuid ? 0 : 0}
                    side={THREE.DoubleSide}
                />

                  <Html position={[0, 0.05, 0]} distanceFactor={4.5} center className="w-[200px] flex font-[600] inter-tight flex-col items-center gap-[6px]">

                      {isSocketLoading ? (
                          <Loader className="animate-spin w-6 h-6 text-white" />
                      ) : (
                          <>
                              <div className="flex gap-2 items-center text-white">
                                  <span>{assignedName}</span>
                              </div>

                              <div className="shadow-lg w-fit bg-black p-2 flex items-center justify-center rounded-full cursor-pointer hover:scale-110 ease-in-out duration-300">
                                  <THvacStatusIcon
                                      width={25}
                                      height={25}
                                      activeStatus={activeStatus}  // Use actual run mode
                                      className={`!bg-[${runModeBGColor}]`}  // Use dynamic bg color
                                      onClick={() => { handleClick(p.pos, p.index, p.name); }}
                                  />
                              </div>
                              <span className="flex flex-col items-center bg-black p-1 px-2.5 rounded-[4px] border border-[#FFFFFF29]">
                                  <p className="text-white text-[14px]">{temperature}° C</p>
                              </span>
                          </>
                      )}
                  </Html>
              </mesh>
          );
      });
  }, [childPositions, hoveredUuid, data, isSocketLoading]);


  return (
    <group>
      <primitive object={scene} />
      <FrameModel model={scene} />
      {hotspotMeshes}
    </group>
  );
}

export default function ModelViewer() {
  const { data } = useMideaStore();

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>(""); // Only track room name
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // LIVE DEVICE LOOKUP - always fresh from store
  const getLiveDevice = useCallback((roomName: string): HvacMideaDevice | null => {
    if (!data?.metadata) return null;
    const cleaned = roomName.startsWith("00") ? roomName.slice(2) : roomName;
    return data.metadata.find(d => d.tenantRoom?.assigned_name === cleaned) || null;
  }, [data?.metadata]);

  // Get current live device based on selected room
  const liveDrawerDevice = useMemo(() => {
    return getLiveDevice(selectedRoomName);
  }, [getLiveDevice, selectedRoomName]);

  const handleOpenDrawer = useCallback((index: number, childName: string) => {
    setSelectedRoomName(childName || `Room ${index + 1}`);
    setDrawerOpen(true);
    onOpen();
  }, [onOpen]);

  // Auto-close logic
  useEffect(() => {
    if (!drawerOpen || selectedRoomName) return;
    setDrawerOpen(false);
    onClose();
  }, [onClose, drawerOpen, selectedRoomName]);

  // url="/models/Delta_9_Exterior-Model.glb"
  let background_model = "/models/Delta_9_Exterior-Model.glb";

  
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      
      <TWeatherForcasting />

      <Canvas 
        camera={{ fov: 5, near: 1.5, far: 2000 }}
        className="w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Suspense
          fallback={
            <Html center>
              <div className="flex flex-col items-center justify-center px-8 py-6 
                              bg-white/25 rounded-2xl text-gray-700 w-80 animate-pulse">

                {/* Skeleton header */}
                <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>

                {/* Skeleton content lines */}
                <div className="h-4 w-56 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-52 bg-gray-200 rounded mb-4"></div>

                {/* Skeleton button */}
                <div className="h-10 w-32 bg-gray-300 rounded-full"></div>
              </div>
            </Html>
          }>

          <ambientLight intensity={2.0} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          
          <ModelContent
              // url="/models/D_9_GF-22.glb"
              url={background_model}
              controlsRef={controlsRef}
              onOpenDrawer={handleOpenDrawer}
            />

            <ModelContent
              // url="/models/D_9_GF-22.glb"
              url="/models/D_9_GF-Main.glb"
              // url={background_model}
              controlsRef={controlsRef}
              onOpenDrawer={handleOpenDrawer}
            />
        </Suspense>

        {/* disable orbit controls */}
        <OrbitControls
          ref={controlsRef}
          enableRotate={false}
          enableZoom={true}
          maxZoom={10}      // ← Much lower (less zoom in)
          minZoom={20}      // ← Allow minimal zoom
          enablePan={true}
          minDistance={22}  // ← Much higher minimum distance
          maxDistance={100} // ← Higher max distance
          maxPolarAngle={Math.PI / 2.5}
          minPolarAngle={0}
        />

        {/* <OrbitControls
          ref={controlsRef}
          enableRotate={false}
          enableZoom={true}
          maxZoom={10}
          minZoom={40}
          enablePan={true}
          minDistance={5}
          maxDistance={70}
          maxPolarAngle={Math.PI / 2.5}
          minPolarAngle={0}
          onChange={() => {
            if (!controlsRef.current) return;

            // Log camera position
            // console.log("Camera Position:", controlsRef.current.object.position);

            // Log model position
            // console.log("Model Position:", modelRef.current?.position);
          }}
        /> */}
      </Canvas>

      {/* Simple Drawer */}
      {drawerOpen && (
        <div className="absolute top-0 right-0 max-w-[596px] h-full p-6 transform transition-transform duration-300">
          <main className="w-full h-full flex flex-col items-center justify-center orbitron-font">
            <ACControlDrawer
                data={[liveDrawerDevice!]}      // Always LIVE from store
                onClose={() => {
                  setDrawerOpen(false);
                  setSelectedRoomName("");
                  onClose();
                }}
                isMatchedRoom={true}
              />
          </main>
        </div>
      )}
    </div>
  );
}