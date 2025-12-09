"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Html } from "@react-three/drei";
import TWeatherForcasting from "@/components/TWeatherForcasting";
import { TAnimatedLine } from "@/components/TAnimatedLine";
// import { useRouter } from "next/navigation";
import { useThree } from "@react-three/fiber";
import { useMemo, Suspense, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";


// Cache model ahead of time (important for modal re-open)
useGLTF.preload("/models/nastp.glb");

function Model() {
  const { scene } = useGLTF("/models/nastp.glb");
  return <primitive object={scene} scale={5.5} position={[0, -4.5, 0]} />;
}

interface InfoBoxProps {
  id: string;
  target: [number, number, number];
  lineStart: [number, number, number];
  title: string;
  fas: string[];
  hvac: string[];
  route: string;
  offset?: [number, number, number];
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  activeBox: string | null;
  setActiveBox: React.Dispatch<React.SetStateAction<string | null>>;
}

export function InfoBox({
  id,
  target,
  lineStart,
  title,
  fas,
  hvac,
  offset = [1.5, 1.5, 0],
  controlsRef,
  activeBox,
  setActiveBox,
}: InfoBoxProps) {
  
  const { camera } = useThree();
  // const router = useRouter();

  const position = useMemo(() => {
    const targetVec = new THREE.Vector3(...target);
    const dir = new THREE.Vector3().subVectors(camera.position, targetVec).normalize();
    return targetVec.clone().add(dir.multiplyScalar(2)).add(new THREE.Vector3(...offset));
  }, [camera.position, target, offset]);

  const handleClick = () => {
    const startVec = new THREE.Vector3(...lineStart);

    gsap.to(camera.position, {
      x: startVec.x + 3,
      y: startVec.y + 3,
      z: startVec.z + 5,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(startVec);
        if (controlsRef.current) controlsRef.current.update();
      },
      onComplete: () => {
        setActiveBox(id); // mark this InfoBox as active
        gsap.to(camera.position, {
          x: startVec.x,
          y: startVec.y,
          z: startVec.z,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            camera.lookAt(startVec);
            if (controlsRef.current) controlsRef.current.update();
          },
        });

        gsap.to(camera.rotation, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            camera.lookAt(startVec);
            if (controlsRef.current) controlsRef.current.update();
          },
        });

        // navigate to route
        // router.push(route);
      },
    });
  };

  const isActive = activeBox === id;

  return (
    <>
      <Html position={position.toArray()} distanceFactor={8} center>
        <div
          onClick={handleClick}
          className={`cursor-pointer rounded-lg p-3 w-56 transition-all duration-300 
            ${isActive 
              ? "bg-blue-100 border-2 border-blue-500 shadow-2xl scale-105" 
              : "bg-white/95 border border-gray-300 shadow-xl hover:scale-105 hover:shadow-2xl"
            }`}
        >
          <h3 className="text-base font-bold text-gray-800 mb-2">{title}</h3>
          <h4 className="text-sm font-semibold text-red-600">FAS</h4>
          <ul className="text-xs text-gray-600 list-disc ml-4 mb-2">
            {fas.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
          <h4 className="text-sm font-semibold text-blue-600">HVAC</h4>
          <ul className="text-xs text-gray-600 list-disc ml-4">
            {hvac.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </div>
      </Html>

      <TAnimatedLine
        start={target}
        end={position.toArray()}
        color={isActive ? "red" : "white"} // dynamic line color
      />
    </>
  );
}

export default function BuildingModel() {
  
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [activeBox, setActiveBox] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <TWeatherForcasting />

      <Canvas 
          camera={{ position: [3, 7, 20], fov: 60 }}
          >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Model wrapped with Suspense for loader Skeleton */}
        <Suspense
          fallback={
            <Html center>
              <div className="flex flex-col items-center justify-center px-8 py-6 bg-white/25 rounded-2xl text-gray-700 w-80 animate-pulse">
                
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
          }
        >
        {/* Model wrapped with Suspense for loader Skeleton */}

          <Model />

          {/* InfoBoxes */}
          <InfoBox
            id="delta-1"
            controlsRef={controlsRef}
            target={[-11.0, -1.5, 5]}
            lineStart={[-16.0, -12.0, -12]}
            title="Delta 1"
            route={`/delta/1/1`}
            activeBox={activeBox}
            setActiveBox={setActiveBox}
            fas={[
              "Location hierarchy",
              "Smoke sensor readings",
              "MCP activation",
              "Buzzer / Flasher status",
            ]}
            hvac={[
              "On/Off status",
              "Mode (Cooling/Heating)",
              "Temperature setpoints",
              "Room temperature",
            ]}
          />

          <InfoBox
            id="delta-2"
            controlsRef={controlsRef}
            target={[-11.0, -3.5, 0]}
            lineStart={[-16.0, -12.0, -12]}
            title="Delta 2"
            route={`/delta/2/1`}
            activeBox={activeBox}
            setActiveBox={setActiveBox}
            fas={[
              "Location hierarchy",
              "Smoke sensor readings",
              "MCP activation",
              "Buzzer / Flasher status",
            ]}
            hvac={[
              "On/Off status",
              "Mode (Cooling/Heating)",
              "Temperature setpoints",
              "Room temperature",
            ]}
          />

          <InfoBox
            id="delta-3"
            target={[-7.0, -3.5, -5]}
            lineStart={[2.0, 1.0, 8]}
            controlsRef={controlsRef}
            activeBox={activeBox}
            setActiveBox={setActiveBox}
            title="Delta 3"
            route={`/delta/3/1`}
            fas={[
              "Location hierarchy",
              "Smoke sensor readings",
              "MCP activation",
              "Buzzer / Flasher status",
            ]}
            hvac={[
              "On/Off status",
              "Mode (Cooling/Heating)",
              "Temperature setpoints",
              "Room temperature",
            ]}
          />

          <InfoBox
            id="delta-4"
            target={[-1.0, -3.5, -12]}
            lineStart={[-8.0, 8.0, 2]}
            controlsRef={controlsRef}
            activeBox={activeBox}
            setActiveBox={setActiveBox}
            title="Delta 4"
            route={`/delta/4/1`}
            fas={[
              "Location hierarchy",
              "Smoke sensor readings",
              "MCP activation",
              "Buzzer / Flasher status",
            ]}
            hvac={[
              "On/Off status",
              "Mode (Cooling/Heating)",
              "Temperature setpoints",
              "Room temperature",
            ]}
          />

          <InfoBox
            id="delta-6"
            target={[1.5, -2.5, 2]}
            lineStart={[0.5, -10.5, -2]}
            controlsRef={controlsRef}
            title="Delta 6"
            route={`/delta/6/1`}
            activeBox={activeBox}
            setActiveBox={setActiveBox}
            fas={[
              "Location hierarchy",
              "Smoke sensor readings",
              "MCP activation",
              "Buzzer / Flasher status",
            ]}
            hvac={[
              "On/Off status",
              "Mode (Cooling/Heating)",
              "Temperature setpoints",
              "Room temperature",
            ]}
          />

          <InfoBox
            id="delta-5"
            target={[7.5, -4, -2]}
            lineStart={[16, -5.5, 0]}
            controlsRef={controlsRef}
            title="Delta 5"
            route={`/delta/4/1`}
            activeBox={activeBox}
            setActiveBox={setActiveBox}
            fas={[
              "Location hierarchy",
              "Smoke sensor readings",
              "MCP activation",
              "Buzzer / Flasher status",
            ]}
            hvac={[
              "On/Off status",
              "Mode (Cooling/Heating)",
              "Temperature setpoints",
              "Room temperature",
            ]}
          />
        </Suspense>

        {/* Controls restricted to front side
        - Zoom disabled
        - Pan enabled
        - Min Polar Angle: 45 degrees
        - Max Polar Angle: 90 degrees
        - Min Azimuth Angle: -45 degrees
        - Max Azimuth Angle: 45 degrees
        - Damping Factor: 0.2
        - Enable Rotate: true
        - should rotate only horizontally but 45 degrees from center
        - should not be able to look up or down
        - should not be able to pan left or right
        - should not be able to zoom in or out
        - Enable Damping: true
        - Enable Pan: true
        */}
        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          enablePan={true}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-Math.PI / 2}
          maxAzimuthAngle={Math.PI / 2}
          dampingFactor={0.5}
          enableRotate={true}
          enableDamping={true}
        />
      </Canvas>
    </div>
  );
}

