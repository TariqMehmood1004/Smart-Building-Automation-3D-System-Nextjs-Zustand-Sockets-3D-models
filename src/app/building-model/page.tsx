"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Html } from "@react-three/drei";
import TWeatherForcasting from "@/components/TWeatherForcasting";
import { Suspense, useRef, useState } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { TInfoBox } from "@/components/TInfoBox";


// Cache model ahead of time (important for modal re-open)
useGLTF.preload("/models/low-poly_city_buildings.glb");

function Model() {
  const { scene } = useGLTF("/models/low-poly_city_buildings.glb");
  return <primitive object={scene} scale={4.5} position={[0, -4.5, 0]} />;
}


export default function BuildingModel() {
  
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [activeBox, setActiveBox] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <TWeatherForcasting />

      <Canvas camera={{ position: [5, 5, 10], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Model wrapped with Suspense for loader Skeleton */}
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
          }
        >
        {/* Model wrapped with Suspense for loader Skeleton */}

          <Model />

          {/* InfoBoxes */}
          <TInfoBox
            id="delta-8"
            controlsRef={controlsRef}
            target={[-3, -4, 1]}
            lineStart={[-5, -12, 5]}
            title="Delta-8"
            route={`/delta/8/1`}
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

          <TInfoBox
            id="delta-9"
            target={[-5.5, -1.5, 2]}
            lineStart={[-8.5, -9.5, 5]}
            controlsRef={controlsRef}
            activeBox={activeBox}
            setActiveBox={setActiveBox}
            title="Delta-9"
            route={`/delta/9/1`}
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

          <TInfoBox
            id="delta-10"
            target={[-0.8, -1.5, 2]}
            lineStart={[-3.5, -9.5, 5]}
            controlsRef={controlsRef}
            activeBox={activeBox}
            setActiveBox={setActiveBox}
            title="Delta-10"
            route={`/delta/10/1`}
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

          <TInfoBox
            id="delta-11"
            target={[1.5, -2.5, 2]}
            lineStart={[0.5, -10.5, -2]}
            controlsRef={controlsRef}
            title="Delta-11"
            route={`/delta/11/1`}
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

          <TInfoBox
            id="delta-parking-plaza"
            target={[4.5, -3, 2]}
            lineStart={[9, -7.5, 2]}
            controlsRef={controlsRef}
            title="Parking Plaza"
            route={`/delta/parking-plaza`}
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
          enableZoom={false}
          enablePan={true}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
          dampingFactor={0.2}
          enableRotate={true}
          enableDamping={true}
        />
      </Canvas>
    </div>
  );
}
