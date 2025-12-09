
"use client";

import React, { Suspense, useRef, useLayoutEffect, useMemo, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { cn } from "@/lib/utils";
import THvacStatusIcon from "@/components/Icons/THvacStatusIcon";
import { useMideaStore } from "@/stores/useMideaStore";
import { Loader } from "lucide-react";
import chalk from "chalk";
import ACControlDrawer from "@/components/TACController";


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
    const maxDim = Math.max(size.x, size.y, size.z);

    if (camera instanceof THREE.PerspectiveCamera) {
      const fov = (camera.fov * Math.PI) / 180; // 220
      const distance = (maxDim / 3) / Math.tan(fov / 2) * 1.25;
      camera.position.set(center.x + distance * 0, 17, center.z + distance * 0.05);
      camera.near = Math.max(1.5, distance / 1000);
      camera.far = distance * 1000;
      camera.updateProjectionMatrix();

      // Log camera info
      // console.log("Camera Perspective:");
      // console.log("FOV:", camera.fov);
      // console.log("Position:", camera.position);
      // console.log("Near:", camera.near, "Far:", camera.far);
    }

    if (controls && "target" in controls && "update" in controls) {
      (controls as OrbitControlsImpl).target.copy(center);
      (controls as OrbitControlsImpl).update();
    }

    const bottomOffset = size.y + 0.35;
    const shiftLeft = size.x * 0.35;

    model.position.set(center.x - shiftLeft, bottomOffset * 2.5, center.z - 2.2);

    // Log model info
    // console.log("Model Bounding Box Size:", size);
    // console.log("Model Center:", center);
    // console.log("Model Position:", model.position);
  }, [model, camera, controls]);

  // console.log(chalk.blue(`model: ${JSON.stringify(model, null, 4)}`));


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
  const { scene } = useGLTF(url, true);

  const { camera } = useThree();

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
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
          worldVec = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.6);
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
    const dir = new THREE.Vector3()
      .subVectors(camera.position, controlsRef.current.target)
      .normalize();

    camera.position.copy(targetVec.clone().add(dir.multiplyScalar(10)));
    controlsRef.current.target.copy(targetVec);
    controlsRef.current.update();

    setActiveIndex(index);
    onOpenDrawer(index, name);
  };

  console.log(chalk.blue(`childPositions: ${JSON.stringify(childPositions, null, 4)}`));
  // const names = childPositions.flatMap((c) => c.name).filter(n => n !== "");
  // console.log(chalk.blue(`childPositions: ${names.join(", ")}`));

  const hotspotMeshes = useMemo(() => {
    return childPositions.map((p) => (
      <mesh
        key={p.uuid}
        position={p.pos as unknown as THREE.Vector3}
        // onPointerOver={(e) => { e.stopPropagation(); setHoveredUuid(p.uuid); document.body.style.cursor = "pointer"; }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredUuid(p.uuid) }}
        onPointerOut={() => { setHoveredUuid(null); document.body.style.cursor = "default"; }}
      // onClick={(e) => { e.stopPropagation(); handleClick(p.pos, p.index, p.name); }}
      >
        <sphereGeometry args={[0.2, 100, 100]} />
        <meshStandardMaterial
          color={hoveredUuid === p.uuid ? "" : "yellow"}
          transparent
          opacity={0.45}
        />
        <Html position={[0, 0.05, 0]} distanceFactor={4.5} center className="flex flex-col items-center">

          <div className="flex gap-2 items-center text-white">
            <span>{p.name}</span>
          </div>

          <div className="shadow-lg w-fit bg-black p-2 flex items-center justify-center rounded-full cursor-pointer hover:scale-110 ease-in-out duration-300">
            <THvacStatusIcon
              width={25}
              height={25}
              activeStatus="Dry"
              onClick={() => { handleClick(p.pos, p.index, p.name); }}
            />
          </div>
          <span className="flex flex-col items-center bg-black p-1 px-2 rounded-md">
            <p className="text-white text-[10px] font-semibold">25°C</p>
          </span>
        </Html>
      </mesh>
    ));
  }, [childPositions, hoveredUuid]);

  return (
    <group>
      <primitive object={scene} />
      <FrameModel model={scene} />
      {hotspotMeshes}
    </group>
  );
}


export default function ModelViewer() {
  const {
    data,
    initSocket,
    isSocketLoading,
  } = useMideaStore();

  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const [drawerIndex, setDrawerIndex] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [drawerChildName, setDrawerChildName] = useState<string>("");
  const [isMatchedRoom, setIsMatchedRoom] = useState<boolean>(false);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  if (!data || isSocketLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-zinc-950 text-zinc-200">
        <Loader className="animate-spin w-10 h-10" />
      </div>
    );
  }

  // console.log(chalk.blue(`Fetched Data: ${JSON.stringify(data, null, 4)}`));
  const tenantRoomCode = data.metadata.map(t => t.tenantRoom?.assigned_code)
  console.log(chalk.blue(`tenantRoomCode: ${tenantRoomCode}`));

  return (
    <div className="w-screen h-screen flex items-center justify-center">

      {/* <TWeatherForcasting /> */}

      <Canvas camera={{ fov: 20, near: 0.5, far: 1000 }}>
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

          <ambientLight intensity={6.8} />

          <directionalLight position={[30, 30, 70]} intensity={5} castShadow />

          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <ModelContent
            // url="/models/new-nastp-building-25-11-2025.glb"
            url="/models/old-hassan-09.glb"
            controlsRef={controlsRef}
            onOpenDrawer={(index, childName) => {
              const cleaned = childName.startsWith("00") ? childName.slice(2) : childName;
              const parsed = Number(cleaned);

              const matched = tenantRoomCode.includes(parsed);

              setIsMatchedRoom(matched);
              setDrawerIndex(index);
              setDrawerChildName(cleaned);
              onOpen();
            }}
          />

        </Suspense>


        {/* disable orbit controls */}
        <OrbitControls
          ref={controlsRef}
          enableRotate={false}
          enableZoom={true}
          maxZoom={10}
          minZoom={40}
          enablePan={true}
          onChange={() => {
            if (!controlsRef.current) return;

            // Log camera position
            // console.log("Camera Position:", controlsRef.current.object.position);

            // Log model position
            // console.log("Model Position:", modelRef.current?.position);
          }}
        />


      </Canvas>

      {/* Drawer */}
      <Drawer 
        isOpen={isOpen} 
        size={"lg"} 
        className="absolute top-0 right-0 flex overflow-hidden flex-col items-end justify-end w-full h-full p-7 bg-transparent border-none focus:outline-none outline-none" 
        classNames={{
          base: "sm:data-[placement=right]:m-2 sm:data-[placement=left]:m-2 overflow-hidden rounded-medium",
        }}
        onClose={onClose}
        hideCloseButton
        >
        <DrawerContent>
          {(onClose) => (
            <>
                {/* <DrawerHeader className="flex flex-col gap-1">Drawer Title</DrawerHeader> */}
                <DrawerBody className="w-full h-full flex flex-col items-center justify-center">
                  <ACControlDrawer
                      data={data} 
                      onClose={onClose}
                      isMatchedRoom={isMatchedRoom}
                    />
                </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>

    </div>
  );
}
