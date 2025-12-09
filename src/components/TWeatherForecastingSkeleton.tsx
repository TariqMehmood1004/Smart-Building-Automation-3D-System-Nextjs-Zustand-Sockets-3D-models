"use client";

import { T_SEKELTON_COLOR } from "@/constants/TColors";
import React from "react";

const TWeatherForecastingSkeleton: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col items-end gap-4 animate-pulse">
      {/* Weather Condition */}
      <div
        className="h-12 w-48 rounded"
        style={{ backgroundColor: T_SEKELTON_COLOR }}
      />

      {/* Temperature */}
      <div
        className="h-28 w-56 rounded"
        style={{ backgroundColor: T_SEKELTON_COLOR }}
      />

      {/* Date & Time */}
      <div
        className="h-6 w-64 rounded"
        style={{ backgroundColor: T_SEKELTON_COLOR }}
      />
    </div>
  );
};

export default TWeatherForecastingSkeleton;
