"use client";

import { useState } from "react";
import { Button } from "@heroui/button";

export default function TVolumeControl() {
  const [activeBars, setActiveBars] = useState([false, false, false]);

  const handleClick = (index: number) => {
    // Activate clicked bar and all above (smaller index)
    const newState = activeBars.map((_, i) => i >= index);
    setActiveBars(newState);
  };

  return (
    <div className="flex flex-col items-center gap-[4px]">
      {/* Top bar - widest */}
      <Button
        onClick={() => handleClick(0)}
        isIconOnly
        radius="none"
        className={`w-4 h-6 min-w-0 p-0 cursor-pointer transform transition-all duration-300 ${
          activeBars[0]
            ? "bg-[#217CE5] scale-110 shadow-md"
            : "bg-white hover:bg-[#A1A5A3] scale-100 opacity-70"
        }`}
        style={{
          clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)",
        }}
      />

      {/* Middle bar - medium */}
      <Button
        onClick={() => handleClick(1)}
        isIconOnly
        radius="none"
        className={`w-3 h-6 min-w-0 p-0 cursor-pointer transform transition-all duration-300 ${
          activeBars[1]
            ? "bg-[#217CE5] scale-110 shadow-md"
            : "bg-white hover:bg-[#A1A5A3] scale-100 opacity-70"
        }`}
        style={{
          clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)",
        }}
      />

      {/* Bottom bar - smallest */}
      <Button
        onClick={() => handleClick(2)}
        isIconOnly
        radius="none"
        className={`w-2 h-6 min-w-0 p-0 cursor-pointer transform transition-all duration-300 ${
          activeBars[2]
            ? "bg-[#217CE5] scale-110 shadow-md"
            : "bg-white hover:bg-[#A1A5A3] scale-100 opacity-70"
        }`}
        style={{
          clipPath: "polygon(0 0, 100% 0, 70% 100%, 30% 100%)",
        }}
      />
    </div>
  );
}
