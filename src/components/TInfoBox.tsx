import { TAnimatedLine } from "@/components/TAnimatedLine";
import { useRouter } from "next/navigation";
import { useThree } from "@react-three/fiber";
import { useMemo, Suspense, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Html } from "@react-three/drei";

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

export function TInfoBox({
  id,
  target,
  lineStart,
  title,
  fas,
  hvac,
  route,
  offset = [1.5, 1.5, 0],
  controlsRef,
  activeBox,
  setActiveBox,
}: InfoBoxProps) {
  
  const { camera } = useThree();
  const router = useRouter();

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