
"use client";

import THvacStatusIcon from "@/components/Icons/THvacStatusIcon";
import Image from "next/image";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import React, { Suspense, useRef, useLayoutEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { TInfoBox } from "@/components/TInfoBox"; // assuming your InfoBox is separated
import TWeatherForcasting from "@/components/TWeatherForcasting";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

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
    const fov = (camera.fov * Math.PI) / 220;
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

  const bottomOffset = size.y - 0;
  const shiftLeft = size.x * 0.35;
  model.position.set(center.x - shiftLeft, bottomOffset * 2.7, center.z - 2.5);

  // Log model info
  // console.log("Model Bounding Box Size:", size);
  // console.log("Model Center:", center);
  // console.log("Model Position:", model.position);
}, [model, camera, controls]);

  return null;
}

function ModelContent({ url, controlsRef }: { url: string; controlsRef: React.RefObject<OrbitControlsImpl | null> }) {
  const { scene } = useGLTF(url, true);
  const { camera } = useThree();

  const [activeBox, setActiveBox] = useState<string | null>(null);
  const [hoveredUuid, setHoveredUuid] = useState<string | null>(null);

  const modelRef = useRef<THREE.Object3D>(scene);

  useLayoutEffect(() => {
    modelRef.current = scene;
  }, [scene]);

  const fakeData = useMemo(
    () => [
      { fas: ["Smoke Detector: Active", "Heat Sensor: Normal"], hvac: ["Unit A: Midea", "Filter Clean: Required"] },
      { fas: ["Fire Alarm: OK", "CO Sensor: Normal"], hvac: ["Unit B: Hisense", "Compressor: Normal"] },
      { fas: ["Emergency Light: On", "Temp Sensor: 22°C"], hvac: ["Duct Fan: Midea", "Mode: Cooling"] },
      { fas: ["Smoke Detector: Triggered", "CO2 Sensor: Alert"], hvac: ["Unit C: Hisense", "Power Usage: High"] },
      { fas: ["Manual Call Point: OK", "Fire Bell: Ready"], hvac: ["Vent: Midea", "Status: Auto"] },
      { fas: ["Fire Panel: Online", "Gas Sensor: Safe"], hvac: ["VRF System: Hisense", "Temp: 23°C"] },
      { fas: ["Smoke Detector: OK", "Temp Sensor: 25°C"], hvac: ["Indoor Unit: Midea", "Fan Speed: Medium"] },
      { fas: ["Fire Extinguisher: Checked", "Exit Sign: OK"], hvac: ["Duct: Hisense", "Damper: Open"] },
      { fas: ["Heat Sensor: OK", "Fire Signal: Normal"], hvac: ["Ventilation: Midea", "Humidity: 40%"] },
      { fas: ["Alarm Bell: OK", "CO2 Detector: Normal"], hvac: ["Unit D: Hisense", "Load: Normal"] },
      { fas: ["Fire Alarm: OK", "Temp Sensor: 23°C"], hvac: ["Unit E: Midea", "Energy Saving: On"] },
      { fas: ["Smoke Detector: Normal", "CO Sensor: OK"], hvac: ["HVAC Zone F: Hisense", "Status: Idle"] },
      { fas: ["Temp Sensor: Normal", "Fire Panel: Online"], hvac: ["VRV: Midea", "Filter: Clean"] },
      { fas: ["CO Sensor: OK", "Fire Panel: Online"], hvac: ["HVAC Zone G: Hisense", "Status: Auto"] },
      { fas: ["Manual Call Point: OK", "Smoke Detector: Normal"], hvac: ["Duct Unit: Midea", "Power: Normal"] },
      { fas: ["Fire Alarm: Normal", "Gas Sensor: OK"], hvac: ["HVAC System H: Hisense", "Temp: 21°C"] },
    ],
    []
  );

  const [childPositions, setChildPositions] = useState<
    { uuid: string; name: string; pos: [number, number, number] }[]
  >([]);

  useLayoutEffect(() => {
    if (!scene) return;
    scene.updateMatrixWorld(true);

    const topChildren = scene.children.map((c) => c.children).flat().filter(c => c.children.length > 0);

    const positions = topChildren.map((child) => {
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

      // assert that pos is a tuple [number, number, number]
      const pos: [number, number, number] = [worldVec.x, worldVec.y, worldVec.z];

      return { uuid: child.uuid, name: child.name || "", pos };
    });

    setChildPositions(positions);
  }, [scene]);

  const infoBoxes = useMemo(() => {
    return childPositions.map((p, i) => {
      if (activeBox !== p.uuid) return null;   // only show for active sphere

      const data = fakeData[i % fakeData.length];
      return (
        <></>
      );
    });
  }, [childPositions, fakeData, activeBox]);

  const smoothMove = (from: THREE.Vector3, to: THREE.Vector3, duration = 0.8) => {
    const start = performance.now();

    const animate = (time: number) => {
      const t = Math.min((time - start) / (duration * 1000), 1);

      // smooth easing
      const eased = t * (2.5 - t); // easeOutQuad

      camera.position.lerpVectors(from, to, eased);

      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(
          controlsRef.current.target.clone(),
          to,
          eased
        );
        controlsRef.current.update();
      }

      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  const handleClick = (pos: [number, number, number], uuid: string) => {
    if (!controlsRef.current) return;

    const targetVec = new THREE.Vector3(...pos);

    // direction from current camera to target
    const dir = new THREE.Vector3()
      .subVectors(camera.position, controlsRef.current.target)
      .normalize();

    camera.position.copy(targetVec.clone().add(dir.multiplyScalar(3)));

    controlsRef.current.target.copy(targetVec);
    controlsRef.current.update();

    setActiveBox(uuid);
  };

  const hoverMeshes = useMemo(() => {
    return childPositions.map((p, i) => {
      const data = fakeData[i % fakeData.length];
      return (
        <mesh
          key={p.uuid}
          position={p.pos as unknown as THREE.Vector3}
          onPointerOver={(e) => { e.stopPropagation(); setHoveredUuid(p.uuid); document.body.style.cursor = "pointer"; }}
          onPointerOut={(e) => { 
            e.stopPropagation(); 
            setHoveredUuid(null); 
            document.body.style.cursor = "default"; 

            // if (activeBox === p.uuid) {
            //   setActiveBox(null);
            // }
          }}
          onPointerDown={(e) => {
            e.stopPropagation();

            // if (activeBox === p.uuid) {
            //   setActiveBox(null);
            // }
          }
          }
          onClick={(e) => { 
            e.stopPropagation(); 
            handleClick(p.pos, p.uuid);
          }}
        >
          <sphereGeometry args={[0.6, 100, 100]} />
          <meshStandardMaterial
            color={hoveredUuid === p.uuid ? "red" : "blue"}
            transparent
            opacity={0.5}
            // side={THREE.DoubleSide}
            // wireframe
            // wireframeLinewidth={2}
            // wireframeLinecap="round"
            // wireframeLinejoin="round"
            
          />
          {activeBox === p.uuid && (
            <Html
              fullscreen   // attaches to screen instead of 3D space
              zIndexRange={[10000, 10000]}
              style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: 10000
              }}
            >
              <div className="fixed bottom-0 right-0 w-[400px] h-auto p-4 shadow-lg bg-[#373737] rounded">
                <h1 className="text-2xl font-bold">{p.name || `Zone ${i + 1}`}</h1>
                <p className="text-lg">{data.fas}</p>
                <p className="text-lg">{data.hvac}</p>
                <p className="text-lg">{`/zones/${p.name || i}`}</p>
                <button onClick={() => { handleClick(p.pos, p.uuid); }}>Go to Zone</button>
              </div>
            </Html>
          )}
        </mesh>
      );
    });
  }, [childPositions, hoveredUuid, activeBox, fakeData]);

  return (
    <group onClick={(e) => {
      e.stopPropagation();
      setActiveBox(null);
    } }>
      <primitive object={scene} />
      <FrameModel model={scene} />
      {hoverMeshes}
      {/* {infoBoxes} */}
    </group>
  );
}

export default function ModelViewer() {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [size, setSize] = React.useState("md");

  const handleOpen = (size: any) => {
    setSize(size);
    onOpen();
  };
  
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Image
        src="/images/delta/floors/floor-1.jpg"
        alt="3D Model"
        width={1000}
        height={1000}
        className="w-full h-full object-cover"
        priority
        quality={100}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading="eager"
        unoptimized
      />

      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <div className="absolute top-20 left-[55%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
        
          <div className="shadow-lg bg-black p-2 rounded-full cursor-pointer hover:scale-110 ease-in-out duration-300">
            <THvacStatusIcon
              width={25}
              height={25}
              activeStatus="Dry"
              onClick={() => handleOpen(size)}
            />
          </div>
          <span className="flex flex-col items-center bg-black p-1 px-2 rounded-md">
            <p className="text-white text-[10px] font-semibold">25°C</p>
          </span>
        </div>
      </div>

      <Drawer isOpen={isOpen} hideCloseButton={false} size={"lg"} className="w-full h-full p-7 bg-transparent border-none focus:outline-none outline-none" onClose={onClose}>
        <DrawerContent>
          {(onClose) => (
            <>
            <div className="w-full h-full p-6 bg-[#161616] border border-[#0D8FAC] relative">
              <div
                className="w-2.5 h-2.5 bg-[#0D8FAC] absolute top-0 left-1/2 -translate-x-1/2"
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)'
                }}
              >
                <span className="w-2.5 h-2.5 bg-[#0D8FAC]"></span>
              </div>

              <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute top-0 left-0"></span>
              <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute top-0 right-0"></span>
              <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute bottom-0 right-0"></span>
              <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute bottom-0 left-0"></span>
              
              <div
                className="w-2.5 h-2.5 bg-[#0D8FAC] absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                }}
              >
                <span className="w-2.5 h-2.5 bg-[#0D8FAC]"></span>
              </div>

              {/* <DrawerHeader className="flex flex-col gap-1">Drawer Title</DrawerHeader> */}
              <DrawerBody>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                  risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                  quam.
                </p>
                <p>
                  Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit dolor
                  adipisicing. Mollit dolor eiusmod sunt ex incididunt cillum quis. Velit duis sit
                  officia eiusmod Lorem aliqua enim laboris do dolor eiusmod.
                </p>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </DrawerFooter>
            </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
