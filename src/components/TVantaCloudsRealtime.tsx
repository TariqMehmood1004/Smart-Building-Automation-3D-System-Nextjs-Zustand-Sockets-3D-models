"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import CLOUDS from "vanta/dist/vanta.clouds.min";

type VantaEffect = {
  destroy: () => void;
};

const TVantaCloudsRealtime = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<VantaEffect | null>(null);

  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      vantaEffect.current = CLOUDS({
        el: vantaRef.current,
        THREE,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,

        // 🌌 Dark Professional Theme
        skyColor: 0x2f2f30,
        cloudColor: 0x5dade2,
        cloudShadowColor: 0x1b4f72,
        sunColor: 0xf4d03f,
        sunGlareColor: 0xffc300,
        sunlightColor: 0xf9e79f,

        // ⚡ Performance Tweaks
        speed: 0.5,              // smoother, less CPU intensive
        cloudShadow: true,       // enable depth feel
        cloudOpacity: 0.85,      // softer rendering, lighter on GPU
        cloudCount: 15,          // reduced for balance (1 looks empty)
        texturePath: undefined,  // avoid extra texture fetch
        scale: 1.2,              // slightly zoomed for less object movement
        backgroundAlpha: 1.0,    // solid background
      });
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="absolute inset-0 -z-10 w-full min-h-screen overflow-hidden"
      style={{ backgroundColor: "#2F2F30" }}
    />
  );
};

export default TVantaCloudsRealtime;
