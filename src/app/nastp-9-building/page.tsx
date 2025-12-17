"use client";

import React, { Suspense, useRef, useLayoutEffect, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
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

// Component to handle zoom detection and auto-reset
function ZoomWatcher({ 
  controlsRef, 
  defaultCameraState,
  onResetToDefault 
}: { 
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  defaultCameraState: React.MutableRefObject<{ position: THREE.Vector3; target: THREE.Vector3 } | null>;
  onResetToDefault: () => void;
}) {
  const { camera } = useThree();
  const lastDistanceRef = useRef<number | null>(null);
  const zoomThreshold = 0.5; // Sensitivity for detecting zoom out
  
  useFrame(() => {
    if (!controlsRef.current || !defaultCameraState.current) return;
    
    const currentDistance = camera.position.distanceTo(controlsRef.current.target);
    
    // Initialize on first frame
    if (lastDistanceRef.current === null) {
      lastDistanceRef.current = currentDistance;
      return;
    }
    
    // Check if user is zooming out (distance increasing)
    const distanceDelta = currentDistance - lastDistanceRef.current;
    
    // If zooming out beyond threshold, reset to default
    if (distanceDelta > zoomThreshold) {
      onResetToDefault();
    }
    
    lastDistanceRef.current = currentDistance;
  });
  
  return null;
}

function AnimatedHotspot({
  children,
  index,
  activeIndex,
  hovered,
}: {
  children: React.ReactNode;
  index: number;
  activeIndex: number | null;
  hovered: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const floatOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();

    // sine floating
    ref.current.position.y += Math.sin(t * 1.5 + floatOffset) * 0.002;

    // persistent active scale
    const targetScale =
      activeIndex === index ? 1.15 : hovered ? 1.08 : 1;

    ref.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  return <group ref={ref}>{children}</group>;
}

// Animation helper for smooth camera transitions
function useCameraAnimation(
  camera: THREE.Camera,
  controls: OrbitControlsImpl | null
) {
  const animationRef = useRef<{
    isAnimating: boolean;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
    progress: number;
  } | null>(null);

  useFrame(() => {
    if (!animationRef.current?.isAnimating || !controls) return;

    const anim = animationRef.current;
    anim.progress += 0.05; // Animation speed (0.05 = ~1 second)

    if (anim.progress >= 1) {
      camera.position.copy(anim.endPos);
      controls.target.copy(anim.endTarget);
      controls.update();
      animationRef.current.isAnimating = false;
      return;
    }

    // Smooth easing function (ease-in-out)
    const eased = anim.progress < 0.5
      ? 2 * anim.progress * anim.progress
      : 1 - Math.pow(-2 * anim.progress + 2, 2) / 2;

    camera.position.lerpVectors(anim.startPos, anim.endPos, eased);
    controls.target.lerpVectors(anim.startTarget, anim.endTarget, eased);
    controls.update();
  });

  const animateTo = useCallback((targetPos: THREE.Vector3, targetLookAt: THREE.Vector3) => {
    if (!controls) return;

    animationRef.current = {
      isAnimating: true,
      startPos: camera.position.clone(),
      endPos: targetPos.clone(),
      startTarget: controls.target.clone(),
      endTarget: targetLookAt.clone(),
      progress: 0,
    };
  }, [camera, controls]);

  return animateTo;
}

function FrameModel({ 
  model, 
  defaultCameraState,
  onStoreDefaultCamera 
}: { 
  model: THREE.Object3D;
  defaultCameraState: React.MutableRefObject<{ position: THREE.Vector3; target: THREE.Vector3 } | null>;
  onStoreDefaultCamera: (pos: THREE.Vector3, target: THREE.Vector3) => void;
}) {
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
      
      camera.position.set(center.x + 2.5, center.y + distance + 1.2, center.z + 0.2);
      camera.lookAt(center.x, center.y, center.z);
      
      camera.near = Math.max(0.5, distance / 100);
      camera.far = distance * 10;
      camera.updateProjectionMatrix();
    }

    if (controls && "target" in controls && "update" in controls) {
      (controls as OrbitControlsImpl).target.copy(center);
      (controls as OrbitControlsImpl).update();
      
      // Store default camera state after setup
      if (!defaultCameraState.current) {
        onStoreDefaultCamera(camera.position.clone(), center.clone());
      }
    }

    model.position.set(-center.x, -center.y, -center.z);
  }, [model, camera, controls, defaultCameraState, onStoreDefaultCamera]);

  return null;
}

// function ModelContent({
//   url,
//   controlsRef,
//   onOpenDrawer,
//   defaultCameraState,
//   onStoreDefaultCamera
// }: {
//   url: string;
//   controlsRef: React.RefObject<OrbitControlsImpl | null>;
//   onOpenDrawer: (index: number, childName: string) => void;
//   defaultCameraState: React.MutableRefObject<{ position: THREE.Vector3; target: THREE.Vector3 } | null>;
//   onStoreDefaultCamera: (pos: THREE.Vector3, target: THREE.Vector3) => void;
// }) {

//   const {
//     data,
//     initSocket,
//     isSocketLoading,
//   } = useMideaStore();

//   useEffect(() => {
//     initSocket();    
//   }, [initSocket]);
  
//   // 3D modeling content
//   const { scene } = useGLTF(url, true);

//   const { camera } = useThree();

//   const [, setActiveIndex] = useState<number | null>(null);
//   const [hoveredUuid, setHoveredUuid] = useState<string | null>(null);

//   const modelRef = useRef<THREE.Object3D>(scene);

//   // Camera settings
//   const zoomDistance = 30.0;

//   // Add camera animation hook
//   const animateCameraTo = useCameraAnimation(camera, controlsRef.current);

//   useLayoutEffect(() => {
//     modelRef.current = scene;
//   }, [scene]);

//   const [childPositions, setChildPositions] = useState<
//     { uuid: string; name: string; pos: [number, number, number]; index: number }[]
//   >([]);

//   useLayoutEffect(() => {
//     if (!scene) return;
//     scene.updateMatrixWorld(true);

//     const topChildren = scene.children.map((c) => c.children).flat().filter(c => c.children.length > 0);

//     const positions = topChildren.map((child, index) => {
//       child.updateMatrixWorld(true);
//       let worldVec = new THREE.Vector3();
//       const mesh = child.getObjectByProperty("type", "Mesh") as THREE.Mesh | undefined;

//       if (mesh) {
//         mesh.updateWorldMatrix(true, false);
//         const geom = mesh.geometry as THREE.BufferGeometry;
//         if (geom) {
//           if (!geom.boundingBox) geom.computeBoundingBox();
//           const box = geom.boundingBox!.clone();
//           const min = box.min.clone().applyMatrix4(mesh.matrixWorld);
//           const max = box.max.clone().applyMatrix4(mesh.matrixWorld);
//           worldVec = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
//         } else mesh.getWorldPosition(worldVec);
//       } else {
//         child.getWorldPosition(worldVec);
//       }

//       return { 
//         uuid: child.uuid, name: child.name || "", 
//         pos: [worldVec.x, worldVec.y, worldVec.z] as [number, number, number], 
//         index 
//       };
//     });

//     setChildPositions(positions);
//   }, [scene]);

//   const handleClick = (pos: [number, number, number], index: number, name: string) => {
//       if (!controlsRef.current) return;

//       const targetVec = new THREE.Vector3(...pos);
//       const currentDir = new THREE.Vector3()
//           .subVectors(camera.position, controlsRef.current.target)
//           .normalize();
      
//       const newCameraPos = targetVec.clone().add(currentDir.multiplyScalar(zoomDistance));

//       // Use smooth animation instead of instant jump
//       animateCameraTo(newCameraPos, targetVec);

//       setActiveIndex(index);
//       onOpenDrawer(index, name);
//   };

//   const handleOnZoomClick = (pos: [number, number, number], index: number) => {
//       if (!controlsRef.current) return;

//       const targetVec = new THREE.Vector3(...pos);
//       const currentDir = new THREE.Vector3()
//           .subVectors(camera.position, controlsRef.current.target)
//           .normalize();
      
//       const newCameraPos = targetVec.clone().add(currentDir.multiplyScalar(zoomDistance));

//       // Use smooth animation
//       animateCameraTo(newCameraPos, targetVec);

//       setActiveIndex(index);
//   };

//   // In hotspotMeshes useMemo
//   const [ripples, setRipples] = useState<number[]>([]);
//   const hotspotMeshes = useMemo(() => {
    
//       const spawnRipple = () => {
//         const id = Date.now();
//         setRipples(r => [...r, id]);
//         setTimeout(() => {
//           setRipples(r => r.filter(x => x !== id));
//         }, 2000);
//       };

//       return childPositions.map((p) => {
//         console.log(chalk.green(`Processing hotspot for ${JSON.stringify(p, null, 4)}`));

//           const assignedName = data?.metadata.map(d => d.tenantRoom?.assigned_name === p.name ? d.deviceSn : null).filter(Boolean)[0] || `${p.name}: Unknown Room`;
//           const temperature = data?.metadata.map(d => d.tenantRoom?.assigned_name === p.name ? d.set_temperature : null).filter(Boolean)[0] || 0;
          
//           const newData = data?.metadata.map(d => d.tenantRoom?.assigned_name === p.name ? d : null).filter(Boolean)[0] || null;
          
//           // Get the actual run mode from newData
//           const currentRunMode = newData?.run_mode;
//           const runModeBGColor = MideaRunModes.find(m => m.mode === currentRunMode)?.bg || '#27AE60'; // default to Auto
          
//           // Map run_mode number to activeStatus string
//           const activeStatus = getActiveStatus(currentRunMode as number);

//           console.log(chalk.blue(`activeStatus for ${p.name}: ${activeStatus}`));

//           {ripples.map(id => (
//             <mesh key={id}>
//               <ringGeometry args={[1.2, 1.4, 32]} />
//               <meshBasicMaterial
//                 transparent
//                 opacity={0.8}
//                 color="#00ff96"
//               />
//             </mesh>
//           ))}

//           return (
//               <mesh
//                   key={p.uuid}
//                   position={p.pos as unknown as THREE.Vector3}
//                   onPointerOver={(e) => { e.stopPropagation(); setHoveredUuid(p.uuid); document.body.style.cursor = "pointer"; }}
//                   onPointerOut={() => { setHoveredUuid(null); document.body.style.cursor = "default"; }}
//                   onClick={(e) => { 
//                       e.stopPropagation(); 
//                       handleOnZoomClick(p.pos, p.index);
//                   }}
//               >
//                   {/* Rectangle with hover */}
//                   <boxGeometry 
//                     args={[2.3, 3.6, 1.6]}
//                   />

//                   <meshBasicMaterial
//                     color={hoveredUuid === p.uuid ? "" : "blue"}
//                     transparent={true}
//                     opacity={hoveredUuid === p.uuid ? 0 : 0}
//                     side={THREE.DoubleSide}
//                 />

//                   <Html position={[0, 0.05, 0]} distanceFactor={4.5} center className="w-[200px] flex font-[600] inter-tight flex-col items-center gap-[6px]">

//                       {isSocketLoading ? (
//                           <Loader className="animate-spin w-6 h-6 text-white" />
//                       ) : (
//                           <>
//                               <div className="flex gap-2 items-center text-white transition-all duration-300">
//                                   <span className={hoveredUuid === p.uuid ? "scale-105" : ""}>{assignedName}</span>
//                               </div>

//                               <div className={`shadow-lg w-fit bg-black p-2 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 ${
//                                 hoveredUuid === p.uuid ? "scale-125 shadow-2xl" : "hover:scale-110"
//                               }`}>
//                                   <THvacStatusIcon
//                                       width={25}
//                                       height={25}
//                                       activeStatus={activeStatus}
//                                       className={`!bg-[${runModeBGColor}]`}
//                                       onClick={() => { handleClick(p.pos, p.index, p.name); }}
//                                   />
//                               </div>
//                               <span className={`flex flex-col items-center bg-black p-1 px-2.5 rounded-[4px] border border-[#FFFFFF29] transition-all duration-300 ${
//                                 hoveredUuid === p.uuid ? "scale-105" : ""
//                               }`}>
//                                   <p className="text-white text-[14px]">{temperature}° C</p>
//                               </span>
//                           </>
//                       )}
//                   </Html>
//               </mesh>
//           );
//       });
//   }, [childPositions, hoveredUuid, data, isSocketLoading]);

//   return (
//     <group>
//       <primitive object={scene} />
//       <FrameModel 
//         model={scene} 
//         defaultCameraState={defaultCameraState}
//         onStoreDefaultCamera={onStoreDefaultCamera}
//       />
//       {hotspotMeshes}
//     </group>
//   );
// }
function ModelContent({
  url,
  controlsRef,
  onOpenDrawer,
  defaultCameraState,
  onStoreDefaultCamera
}: {
  url: string;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  onOpenDrawer: (index: number, childName: string) => void;
  defaultCameraState: React.MutableRefObject<{ position: THREE.Vector3; target: THREE.Vector3 } | null>;
  onStoreDefaultCamera: (pos: THREE.Vector3, target: THREE.Vector3) => void;
}) {

  const {
    data,
    initSocket,
    isSocketLoading,
  } = useMideaStore();

  useEffect(() => {
    initSocket();    
  }, [initSocket]);
  
  const { scene } = useGLTF(url, true);
  const { camera } = useThree();

  const [, setActiveIndex] = useState<number | null>(null);
  const [hoveredUuid, setHoveredUuid] = useState<string | null>(null);
  const [clickedUuid, setClickedUuid] = useState<string | null>(null);

  const modelRef = useRef<THREE.Object3D>(scene);
  const zoomDistance = 30.0;

  const animateCameraTo = useCameraAnimation(camera, controlsRef.current);

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
      const currentDir = new THREE.Vector3()
          .subVectors(camera.position, controlsRef.current.target)
          .normalize();
      
      const newCameraPos = targetVec.clone().add(currentDir.multiplyScalar(zoomDistance));

      animateCameraTo(newCameraPos, targetVec);

      setActiveIndex(index);
      onOpenDrawer(index, name);
  };

  const handleOnZoomClick = (pos: [number, number, number], index: number, uuid: string) => {
      if (!controlsRef.current) return;

      // Trigger click animation
      setClickedUuid(uuid);
      setTimeout(() => setClickedUuid(null), 800);

      // Spawn ripples
      spawnRipple(uuid);

      const targetVec = new THREE.Vector3(...pos);
      const currentDir = new THREE.Vector3()
          .subVectors(camera.position, controlsRef.current.target)
          .normalize();
      
      const newCameraPos = targetVec.clone().add(currentDir.multiplyScalar(zoomDistance));

      animateCameraTo(newCameraPos, targetVec);

      setActiveIndex(index);
  };

  // Enhanced ripple system with multiple waves
  const [ripples, setRipples] = useState<{ id: number; uuid: string }[]>([]);
  
  const spawnRipple = (uuid: string) => {
    const id = Date.now();
    setRipples(r => [...r, { id, uuid }]);
    setTimeout(() => {
      setRipples(r => r.filter(x => x.id !== id));
    }, 1500);
  };

  // Animated ripple component
  const AnimatedRipple = ({ uuid, rippleId }: { uuid: string; rippleId: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
      if (!meshRef.current) return;
      const elapsed = (Date.now() - rippleId) / 1500;
      
      // Expand and fade out
      const scale = 1 + elapsed * 3;
      meshRef.current.scale.set(scale, scale, 1);
      
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0, 1 - elapsed);
    });

    return (
      <mesh ref={meshRef}>
        <ringGeometry args={[1.8, 2.2, 32]} />
        <meshBasicMaterial
          transparent
          opacity={1}
          color="#00ff96"
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  };

  // Particle burst effect
  const ParticleBurst = ({ uuid }: { uuid: string }) => {
    const particlesRef = useRef<THREE.Points>(null);
    const startTime = useRef(Date.now());
    
    const particleCount = 20;
    const positions = useMemo(() => {
      const arr = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        arr[i * 3] = 0;
        arr[i * 3 + 1] = 0;
        arr[i * 3 + 2] = 0;
      }
      return arr;
    }, []);

    const velocities = useMemo(() => {
      return Array.from({ length: particleCount }, () => ({
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3,
        z: (Math.random() - 0.5) * 3,
      }));
    }, []);

    useFrame(() => {
      if (!particlesRef.current) return;
      const elapsed = (Date.now() - startTime.current) / 800;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = velocities[i].x * elapsed;
        positions[i * 3 + 1] = velocities[i].y * elapsed;
        positions[i * 3 + 2] = velocities[i].z * elapsed;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      
      const material = particlesRef.current.material as THREE.PointsMaterial;
      material.opacity = Math.max(0, 1 - elapsed);
    });

    return (
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
            name="position"
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.3}
          color="#00ff96"
          transparent
          opacity={1}
          sizeAttenuation
        />
      </points>
    );
  };

  const hotspotMeshes = useMemo(() => {
      return childPositions.map((p) => {
          console.log(chalk.green(`Processing hotspot for ${JSON.stringify(p, null, 4)}`));

          const assignedName = data?.metadata.map(d => d.tenantRoom?.assigned_name === p.name ? d.deviceSn : null).filter(Boolean)[0] || `${p.name}: Unknown Room`;
          const temperature = data?.metadata.map(d => d.tenantRoom?.assigned_name === p.name ? d.set_temperature : null).filter(Boolean)[0] || 0;
          
          const newData = data?.metadata.map(d => d.tenantRoom?.assigned_name === p.name ? d : null).filter(Boolean)[0] || null;
          const currentRunMode = newData?.run_mode;
          const runModeBGColor = MideaRunModes.find(m => m.mode === currentRunMode)?.bg || '#27AE60';
          const activeStatus = getActiveStatus(currentRunMode as number);

          console.log(chalk.blue(`activeStatus for ${p.name}: ${activeStatus}`));

          const isHovered = hoveredUuid === p.uuid;
          const isClicked = clickedUuid === p.uuid;
          const activeRipples = ripples.filter(r => r.uuid === p.uuid);

          return (
              <group key={p.uuid} position={p.pos as unknown as THREE.Vector3}>
                  {/* Ripple effects */}
                  {activeRipples.map(ripple => (
                    <AnimatedRipple key={ripple.id} uuid={p.uuid} rippleId={ripple.id} />
                  ))}

                  {/* Particle burst on click */}
                  {isClicked && <ParticleBurst uuid={p.uuid} />}

                  {/* Main interactive mesh */}
                  <mesh
                      onPointerOver={(e) => { 
                        e.stopPropagation(); 
                        setHoveredUuid(p.uuid); 
                        document.body.style.cursor = "pointer"; 
                      }}
                      onPointerOut={() => { 
                        setHoveredUuid(null); 
                        document.body.style.cursor = "default"; 
                      }}
                      onClick={(e) => { 
                          e.stopPropagation(); 
                          handleOnZoomClick(p.pos, p.index, p.uuid);
                      }}
                  >
                      <boxGeometry args={[1.5, 6.6, 2.5]} />
                      <meshBasicMaterial
                        color="blue"
                        transparent={true}
                        opacity={0}
                        side={THREE.DoubleSide}
                      />
                  </mesh>

                  {/* Glow effect when hovered */}
                  {isHovered && (
                    <mesh>
                      <sphereGeometry args={[2.5, 32, 32]} />
                      <meshBasicMaterial
                        color="#00ff96"
                        transparent
                        opacity={0.15}
                        side={THREE.BackSide}
                      />
                    </mesh>
                  )}

                  <Html 
                    position={[0, 0.05, 0]} 
                    distanceFactor={4.5} 
                    center 
                    className="w-[200px] flex font-[600] inter-tight flex-col items-center gap-[6px]"
                  >
                      {isSocketLoading ? (
                          <Loader className="animate-spin w-6 h-6 text-white" />
                      ) : (
                          <>
                              <div className={`flex gap-2 items-center text-white transition-all duration-300 ${
                                isClicked ? 'animate-pulse' : ''
                              }`}>
                                  <span className={`transition-all duration-300 ${
                                    isHovered ? "scale-110 text-black" : ""
                                  }`}>
                                    {assignedName}
                                  </span>
                              </div>

                              <div className={`
                                shadow-lg w-fit bg-black p-2 flex items-center justify-center 
                                rounded-full cursor-pointer transition-all duration-300
                                ${isHovered ? "scale-125 shadow-[0_0_30px_rgba(0,255,150,0.5)] ring-2 ring-[#00ff96]" : "hover:scale-110"}
                                ${isClicked ? "scale-150 rotate-[360deg]" : ""}
                              `}>
                                  <THvacStatusIcon
                                      width={25}
                                      height={25}
                                      activeStatus={activeStatus}
                                      className={`!bg-[${runModeBGColor}] transition-all duration-300`}
                                      onClick={() => { handleClick(p.pos, p.index, p.name); }}
                                  />
                              </div>

                              <span className={`
                                flex flex-col items-center bg-black p-1 px-2.5 rounded-[4px] 
                                border border-[#FFFFFF29] transition-all duration-300
                                ${isHovered ? "scale-110 border-[#00ff96] shadow-[0_0_15px_rgba(0,255,150,0.3)]" : ""}
                                ${isClicked ? "scale-125" : ""}
                              `}>
                                  <p className={`text-white text-[14px] transition-all duration-300 ${
                                    isHovered ? "text-black" : ""
                                  }`}>
                                    {temperature}° C
                                  </p>
                              </span>
                          </>
                      )}
                  </Html>
              </group>
          );
      });
  }, [childPositions, hoveredUuid, clickedUuid, data, isSocketLoading, ripples]);

  return (
    <group>
      <primitive object={scene} />
      <FrameModel 
        model={scene} 
        defaultCameraState={defaultCameraState}
        onStoreDefaultCamera={onStoreDefaultCamera}
      />
      {hotspotMeshes}
    </group>
  );
}

export default function ModelViewer() {
  const { data } = useMideaStore();

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Store default camera position and target
  const defaultCameraState = useRef<{
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null>(null);

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

  // Store default camera position
  const storeDefaultCamera = useCallback((position: THREE.Vector3, target: THREE.Vector3) => {
    if (!defaultCameraState.current) {
      defaultCameraState.current = { position, target };
    }
  }, []);

  // Reset to default camera view
  const resetToDefaultView = useCallback(() => {
    if (drawerOpen) {
      setDrawerOpen(false);
      setSelectedRoomName("");
      onClose();
    }
  }, [drawerOpen, onClose]);

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
          
          {/* Zoom watcher to detect zoom out */}
          <ZoomWatcher 
            controlsRef={controlsRef} 
            defaultCameraState={defaultCameraState}
            onResetToDefault={resetToDefaultView}
          />
          
          <ModelContent
              url={background_model}
              controlsRef={controlsRef}
              onOpenDrawer={handleOpenDrawer}
              defaultCameraState={defaultCameraState}
              onStoreDefaultCamera={storeDefaultCamera}
            />

            <ModelContent
              url="/models/D_9_GF-Main.glb"
              controlsRef={controlsRef}
              onOpenDrawer={handleOpenDrawer}
              defaultCameraState={defaultCameraState}
              onStoreDefaultCamera={storeDefaultCamera}
            />
        </Suspense>

        {/* disable orbit controls */}
        <OrbitControls
          ref={controlsRef}
          enableRotate={false}
          enableZoom={true}
          maxZoom={10}
          minZoom={20}
          enablePan={true}
          minDistance={22}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2.5}
          minPolarAngle={0}
        />
      </Canvas>

      {/* Drawer with slide animation */}
      {drawerOpen && (
        <div className={`absolute top-0 right-0 max-w-[620px] w-full h-full p-6 transform transition-all duration-500 ease-out z-[999] ${
          drawerOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <main className="w-full h-full flex flex-col items-center justify-center orbitron-font">
            <ACControlDrawer
                data={[liveDrawerDevice!]}
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