"use client";

import { useState } from "react";

interface Modes { 
    id: string; 
    label: string; 
    mode: number; 
    icon: any; 
    color: string; 
    bg: string; 
    image: string;
};

export default function TFanSpeedSlider({ modes, fanSpeed, onFanSpeedChange }: 
    { 
        modes: Modes[]; 
        fanSpeed: number;
        onFanSpeedChange: (val: number) => void;
    }) {
    const [value, setValue] = useState(fanSpeed); // 0–6

    const activeMode = modes[0];                
    const activeBg = activeMode.bg;             
    console.log(`Active Mode:`, activeMode);
    console.log(`Active Mode in Fan Speed Slider: bg-[${activeBg}]`);

    const steps = 7;            
    const max = steps - 1;      
    const maxLines = 25;        // 25 small lines

    const progress = value / max;

    return (
        <div className="w-full bg-[#FFFFFF0A] px-4 py-3 flex items-center justify-center">
            <div className="w-full range-wrapper relative h-[36px] flex items-center justify-center">

                {/* Background track with 25 small lines */}
                <div className="absolute top-[50%] left-0 transform -translate-y-1/2 inset-0 opacity-20 h-[20px] p-2 overflow-hidden"
                    style={{
                        background: `repeating-linear-gradient(
                            to left,
                            ${activeBg} 0 1px,
                            transparent 1px calc((100% - 1px) / ${maxLines - 1})
                        )`,
                        maskImage: `linear-gradient(
                            to right,
                            black ${progress * 100}%,
                            transparent ${progress * 100 + 1}%
                        )`,
                        overflow: "hidden",
                    }}
                />

                {/* Progress mask (color fixed to selected mode) */}
                <div className="absolute top-[50%] left-0 transform -translate-y-1/2 inset-0 h-[20px] p-2 pointer-events-none rounded-tr-full rounded-br-full overflow-hidden"
                    style={{
                        maskImage: `linear-gradient(
                            to right,
                            black ${progress * 100}%,
                            transparent ${progress * 100 + 1}%
                        )`,
                        height: "20px",
                        background: activeBg,
                        transition: "all 180ms linear",
                    }}
                />

                {/* 7 Large step indicators */}
                {Array.from({ length: steps }, (_, i) => (
                    <span
                        key={`step-${i}`}
                        id={`step-${i}`}
                        onClick={() => setValue(i)}
                        className="cursor-pointer h-full w-[6px] absolute top-[23%] transform translate-y-1/2"
                        style={{
                            left: `${i * (100 / max)}%`,
                            height: "19.5px",        // Larger height for steps
                            width: "6px",          // Thicker
                            background: activeBg,
                            transition: "all 180ms linear",
                            opacity: i <= value ? 1 : 0.4,
                            transform: `translate(-50%, -50%) scale(${i <= value ? 1 : 0.8})`
                        }}
                    />
                ))}

                {/* 25 Small background lines (decorative) */}
                {Array.from({ length: maxLines }, (_, i) => (
                    <span
                        key={`line-${i}`}
                        className="h-full w-[2px] absolute top-[50%] transform -translate-y-1/2 opacity-30"
                        style={{
                            left: `${i * (100 / (maxLines - 1))}%`,
                            height: "12px",        // Smaller height
                            width: "2px",          // Thinner
                            background: activeBg,
                            transition: "all 180ms linear"
                        }}
                    />
                ))}

                {/* range slider */}
                <input
                    type="range"
                    min={0}
                    max={max}
                    step={1}
                    value={value}
                    onChange={(e) => {
                        onFanSpeedChange(Number(e.target.value)); 
                        setValue(Number(e.target.value))
                    }}
                    className="w-full"
                    style={{
                        ["--track" as any]: activeBg,
                        ["--lines" as any]: steps,
                        ["--webkit-slider-runnable-track" as any]: activeBg,
                        ["--webkit-slider-thumb" as any]: activeBg,
                    }}
                />
            </div>
        </div>
    );
}
