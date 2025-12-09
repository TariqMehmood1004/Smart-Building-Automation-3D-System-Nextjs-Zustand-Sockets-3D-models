"use client";

import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import TWeatherForecastingSkeleton from "./TWeatherForecastingSkeleton";
import { useWeatherSocketStore } from "@/stores/WeatherForcastingStore";

const TWeatherForecasting: React.FC = () => {
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
        // console.error("Geolocation error:", err);
        initSocket({ latitude: 31.5204, longitude: 74.3587 }); // fallback
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

  // Extract first item from array
  const currentWeather = weatherData && weatherData.length > 0 ? weatherData[0] : null;

  const locationName = currentWeather?.name || "Unknown";
  const country = currentWeather?.sys?.country || "";
  const tempC = currentWeather?.main?.temp ? (currentWeather.main.temp - 273.15).toFixed(1) : "N/A"; // Kelvin -> °C
  const condition = currentWeather?.weather?.[0]?.description || "N/A";
  const humidity = currentWeather?.main?.humidity || "N/A";
  const windSpeed = currentWeather?.wind?.speed || "N/A";
  const icon = currentWeather?.weather?.[0]?.icon;

  const formattedDateTime = useMemo(() => {
    if (!currentWeather?.dt) return "";

    try {
      // convert Unix timestamp to milliseconds
      const date = new Date(currentWeather.dt * 1000);

      // Pakistan Standard Time
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
    <section className="absolute inset-0 w-full min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/cloud-background.png"
          alt="Weather background"
          fill
          className="object-cover opacity-90"
          priority
          sizes="100vw"
        />
      </div>

      {/* Weather Card */}
      <div className="absolute top-[6rem] right-[1%] z-[9999] flex w-[95%] items-end gap-4 rounded-[10px] p-5 text-2xl font-bold text-[#A1A5A3] pointer-events-none">
        {isSocketLoading || !currentWeather ? (
          <TWeatherForecastingSkeleton />
        ) : (
          <div className="flex flex-1 flex-col items-end gap-1">
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

export default React.memo(TWeatherForecasting);
