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

export default function TFanSpeedSlider({ modes }: { modes: Modes[] }) {
    const [value, setValue] = useState(0); // 0–6

    const activeMode = modes[0];                // always the selected mode
    const activeBg = activeMode.bg;             // same bg for slider track

    const steps = 7;               // fixed fan levels
    const max = steps - 1;         // 6
    const progress = value / max;

    return (
        <div className="w-full bg-[#FFFFFF0A] px-4 py-2">
            <div className="w-full range-wrapper relative h-[36px] flex items-center">

                {/* background track with lines */}
                <div 
                    className="absolute inset-0 opacity-20 m-6"
                    style={{
                        background: `repeating-linear-gradient(
                            to left,
                            rgba(255,255,255,0.15) 0 2px,
                            transparent 2px calc((100% - 2px) / (${steps - 1}))
                        )`
                    }}
                />

                {/* progress mask (color fixed to selected mode) */}
                <div
                    className="absolute inset-0 p-2 pointer-events-none"
                    style={{
                        maskImage: `linear-gradient(
                            to right,
                            black ${progress * 100}%,
                            transparent ${progress * 100 + 1}%
                        )`,
                        background: activeBg,
                        transition: "all 180ms linear"
                    }}
                />

                <span className={`h-full w-2 absolute left-0 top-0 ${activeBg}`}></span>

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
                        ["--lines" as any]: steps
                    }}
                />
            </div>
        </div>
    );
}
