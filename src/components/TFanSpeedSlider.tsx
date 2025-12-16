"use client";

import { useState } from "react";

interface Modes { 
    id: string; 
    label: string; 
    mode: number; 
    icon: any; 
    color: string; 
    bg: string; 
    image: string 
};

export default function TFanSpeedSlider({ modes, fanSpeed }: { modes: Modes[]; fanSpeed: number }) {
    const [value, setValue] = useState(fanSpeed); // 0–6

    const activeMode = modes[0];                // always the selected mode
    const activeBg = activeMode.bg;             // same bg for slider track
    console.log(`Active Mode:`, activeMode);
    console.log(`Active Mode in Fan Speed Slider: bg-[${activeBg}]`);

    const steps = 7;               // fixed fan levels
    const max = steps - 1;         // 6

    const progress = value / max;

    return (
        <div className="w-full bg-[#FFFFFF0A] px-4 py-3 flex items-center justify-center">
            <div className="w-full range-wrapper relative h-[36px] flex items-center justify-center">

                {/* background track with lines */}
                <div className="absolute top-[50%] left-0 transform -translate-y-1/2 inset-0 opacity-20 h-[20px] p-2 overflow-hidden"
                    style={{
                        background: `repeating-linear-gradient(
                            to left,
                            ${activeBg} 0 2px,
                            transparent 2px calc((100% - 2px) / (${steps - 1}))
                        )`,
                        maskImage: `linear-gradient(
                            to right,
                            black ${progress * 100}%,
                            transparent ${progress * 100 + 1}%
                        )`,
                        overflow: "hidden",
                    }}
                />

                {/* progress mask (color fixed to selected mode) */}
                <div className="absolute top-[50%] left-0 transform -translate-y-1/2 inset-0 h-[20px] p-2 pointer-events-none rounded-tr-full rounded-br-full overflow-hidden"
                    style={{
                        maskImage: `linear-gradient(
                            to right,
                            black ${progress * 100}%,
                            transparent ${progress * 100 + 1}%
                        )`,
                        height: "20px",
                        background: activeBg,
                        transition: "all 180ms linear"
                    }}
                />

                <span 
                    className={`h-full w-[4px] h-[20px] absolute right-0 top-[50%] transform -translate-y-1/2`}
                    style={{
                        height: "20px",
                        background: activeBg,
                        transition: "all 180ms linear",
                    }}
                ></span>

                {/* range slider */}
                <input
                    type="range"
                    min={0}
                    max={max}
                    step={1}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
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
