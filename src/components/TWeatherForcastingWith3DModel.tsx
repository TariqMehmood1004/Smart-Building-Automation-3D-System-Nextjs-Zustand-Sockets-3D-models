"use client";

import React, { useEffect, useMemo, Suspense, useLayoutEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import TWeatherForecastingSkeleton from "./TWeatherForecastingSkeleton";
import { useWeatherSocketStore } from "@/stores/WeatherForcastingStore";

function FrameModel({ model }: { model: THREE.Object3D }) {
  const { camera, controls } = useThree();

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    if (camera instanceof THREE.PerspectiveCamera) {
      const fov = (camera.fov * Math.PI) / 180;
      const distance = maxDim / Math.tan(fov / 2);
      
      camera.position.set(0, 0, distance * 1.5);
      camera.lookAt(0, 0, 0);
      
      camera.near = distance / 100;
      camera.far = distance * 100;
      camera.updateProjectionMatrix();
    }

    if (controls && "target" in controls && "update" in controls) {
      (controls as OrbitControlsImpl).target.set(0, 0, 0);
      (controls as OrbitControlsImpl).update();
    }

    // Center the model
    model.position.set(-center.x, -center.y, -center.z);
  }, [model, camera, controls]);

  return null;
}

function Model3D({ url }: { url: string }) {
  const { scene } = useGLTF(url, true);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <>
      <primitive object={scene} />
      <FrameModel model={scene} />
    </>
  );
}

const TWeatherForcastingWith3DModel: React.FC = () => {
  const { initSocket, socket, isSocketLoading, weatherData } = useWeatherSocketStore();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        initSocket({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        initSocket({ latitude: 31.5204, longitude: 74.3587 });
      }
    );
  }, [initSocket]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
      }
    };
  }, [socket]);

  const currentWeather = weatherData && weatherData.length > 0 ? weatherData[0] : null;

  const locationName = currentWeather?.name || "Unknown";
  const country = currentWeather?.sys?.country || "";
  const tempC = currentWeather?.main?.temp ? (currentWeather.main.temp - 273.15).toFixed(1) : "N/A";
  const condition = currentWeather?.weather?.[0]?.description || "N/A";
  const humidity = currentWeather?.main?.humidity || "N/A";
  const windSpeed = currentWeather?.wind?.speed || "N/A";
  const icon = currentWeather?.weather?.[0]?.icon;

  const formattedDateTime = useMemo(() => {
    if (!currentWeather?.dt) return "";

    try {
      const date = new Date(currentWeather.dt * 1000);
      return date.toLocaleString("en-US", {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } catch {
      return "";
    }
  }, [currentWeather]);

  return (
    <section className="absolute inset-0 w-screen h-screen">
      {/* 3D Model Background */}
      <div className="absolute inset-0 -z-10">
        <Canvas
          camera={{ fov: 50, near: 0.1, far: 1000, position: [0, 0, 10] }}
          className="w-screen h-screen"
        >
          <Suspense
            fallback={
              <Html center>
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-gray-300 border-t-white rounded-full animate-spin"></div>
                </div>
              </Html>
            }
          >
            <ambientLight intensity={1.2} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} />
            <pointLight position={[0, 10, 0]} intensity={0.8} />
            
            <Model3D url="/models/Delta_9_Exterior-Model.glb" />
            
            <OrbitControls
              enableRotate={true}
              enableZoom={true}
              enablePan={true}
              autoRotate={true}
              autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Weather Card Overlay */}
      <div className="absolute top-[6rem] right-[1%] z-[9999] flex w-[95%] items-end gap-4 rounded-[10px] p-5 text-2xl font-bold text-[#A1A5A3] pointer-events-none">
        {isSocketLoading || !currentWeather ? (
          <TWeatherForecastingSkeleton />
        ) : (
          <div className="flex flex-1 flex-col items-end gap-1 bg-black/30 backdrop-blur-sm rounded-lg p-6">
            {/* Location */}
            <div className="text-muted-foreground text-lg font-normal">{locationName}, {country}</div>

            {/* Condition */}
            <div className="flex items-center gap-2">
              {icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                  alt={condition}
                  width={48}
                  height={48}
                />
              )}
              <span className="text-[48px] font-semibold text-white">{condition}</span>
            </div>

            {/* Temperature */}
            <div>
              <span className="text-[128px] font-semibold text-[#FFB221]">
                {tempC}°C
              </span>
            </div>

            {/* Additional Info */}
            <div className="text-white text-lg">
              Humidity: {humidity}%, Wind: {windSpeed} m/s
            </div>

            {/* Date & Time */}
            <div>
              <span className="text-[18px] font-normal text-white">{formattedDateTime}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(TWeatherForcastingWith3DModel);