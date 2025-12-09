"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";

interface TAnimatedLineProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  onComplete?: () => void;
}

export function TAnimatedLine({ start, end, color = "blue", onComplete }: TAnimatedLineProps) {
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  // Define triangle-based curve (sharp corner at midpoint)
  const midPoint = new THREE.Vector3(
    start[0],
    (start[1] + end[1]) / 2 + 1.5,
    end[2]
  );

  const points: THREE.Vector3[] = [
    new THREE.Vector3(...start),
    midPoint,
    new THREE.Vector3(...end),
  ];

  useFrame(() => {
    setProgress((prev) => {
      const next = prev < 1 ? prev + 0.02 : 1;
      if (next === 1 && !completedRef.current) {
        completedRef.current = true;
        onComplete?.(); // notify parent
      }
      return next;
    });
  });

  // Interpolate points
  const totalSegments = points.length - 1;
  const currentSegment = Math.min(Math.floor(progress * totalSegments), totalSegments - 1);
  const segmentProgress = (progress * totalSegments) - currentSegment;

  let animatedPoints: THREE.Vector3[] = [];
  if (currentSegment === 0) {
    animatedPoints = [
      points[0],
      points[0].clone().lerp(points[1], segmentProgress),
    ];
  } else {
    animatedPoints = [
      points[0],
      points[1],
      points[1].clone().lerp(points[2], segmentProgress),
    ];
  }

  return (
    <>
      {/* Starting dot */}
      <mesh position={start}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Triangle line */}
      <Line points={animatedPoints} color={color} lineWidth={2} dashed={false} />
    </>
  );
}
