import { Loader, Power } from "lucide-react";
import { useState, useEffect } from "react";

interface Modes { 
    id: string; 
    label: string; 
    mode: number; 
    icon: any; 
    color: string; 
    bg: string; 
    image: string 
};

type Props = {
    id: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    modes: Modes[];
    disabled?: boolean;
    onChange?: (val: number) => void;
    onCommit?: (val: number) => void;

    runMode?: number;
    isLoading?: boolean;
    onClick?: () => void;
};

export default function TCircularTemperatureDial({
    id,
    value,
    min = 1,
    max = 32,
    step = 1,
    disabled = false,
    onChange,
    modes,
    onCommit,
    isLoading,
    runMode,
    onClick
}: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    const center = 120;
    const trackRadius = 105;
    const range = max - min;

    // Convert value to percentage (0-1)
    const valueToPercentage = (val: number) => {
        return (val - min) / range;
    };

    // Convert angle to value
    const angleToValue = (angle: number) => {
        // Normalize angle to 0-360
        angle = (angle + 360) % 360;
        
        let fraction = 0;
        if (angle >= 135 && angle <= 360) {
            fraction = (angle - 135) / 270;
        } else if (angle >= 0 && angle <= 45) {
            fraction = (angle + 225) / 270;
        } else {
            // Outside valid range
            return tempValue;
        }
        
        const rawValue = min + fraction * range;
        const snappedValue = Math.round(rawValue / step) * step;
        return Math.min(max, Math.max(min, Number(snappedValue.toFixed(step < 1 ? 1 : 0))));
    };

    useEffect(() => {
        // if runMode === 0 we cannot change the value
        if (runMode === 0) {
            setTempValue(value);
            return;
        }

        // If not dragging, update tempValue to match value prop
        // This allows the dial to reflect changes from outside (e.g. live updates)
        if (!isDragging) {
            setTempValue(value);
        }

        // If dragging, ensure tempValue is within bounds
        if (tempValue < min) {
            setTempValue(min);
        }

        if (tempValue > max) {
            setTempValue(max);
        }

        // If value prop changes, update tempValue
        if (value !== tempValue) {
            setTempValue(value);
        }


    }, [value, isDragging]);

    useEffect(() => {
        if (disabled) return;

        const handleMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const svg = document.getElementById(id);
            if (!svg) return;
            
            const rect = svg.getBoundingClientRect();
            const x = e.clientX - rect.left - center;
            const y = e.clientY - rect.top - center;
            
            const angle = Math.atan2(y, x) * (180 / Math.PI);
            const newValue = angleToValue(angle);
            
            if (newValue !== tempValue) {
                setTempValue(newValue);
                if (onChange) onChange(newValue);
            }
        };

        const handleUp = () => {
            if (isDragging) {
                setIsDragging(false);
                if (onCommit) onCommit(tempValue);
            }
        };

        if (isDragging) {
            window.addEventListener("mousemove", handleMove);
            window.addEventListener("mouseup", handleUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
    }, [isDragging, tempValue, disabled, id]);

    const percentage = valueToPercentage(tempValue);

    // const isDialDisabled = runMode === 0;
    const isPowerEnabled = runMode === 0; // Only enable power button in this mode

    const isDialDisabled = runMode === 0 || disabled;

    const activeMode = modes.find(m => m.mode === runMode);
    const modeColor = activeMode ? activeMode.bg.replace('bg-[', '').replace(']', '') : "#27AE60";

    
    return (
        <div className="flex items-center justify-center">
            <svg
                id={id}
                width={center * 2}
                height={center * 2}
                
                onMouseDown={() => !disabled && setIsDragging(true)}
                className={`select-none ${disabled || isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
            >
                <defs>
                    <linearGradient id={`greenYellowGradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                </defs>

                <svg style={{ position: "absolute", width: 0, height: 0 }}>
                    <defs>
                        {/* Linear Gradient */}
                        <linearGradient id="circleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#060505" />
                            <stop offset="50%" stopColor="#2e2e2e" />
                            <stop offset="100%" stopColor="#312f2f" />
                        </linearGradient>

                        {/* Circle shadow with inner Y-axis shadows and outer stroke */}
                        <filter id="outerCircleShadow" x="-50%" y="-50%" width="200%" height="200%">
                            {/* Drop shadow */}
                            <feDropShadow dx="0" dy="0" stdDeviation="0.83" floodColor="#6f6767" floodOpacity="0.25" />

                            {/* Top inner shadow */}
                            <feOffset dx="0" dy="-0" result="topOffset" /> {/* dy can be slightly negative if needed */}
                            <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="topBlur" />
                            <feComposite in="topBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="topInner" />
                            <feFlood floodColor="#595959" floodOpacity="1" result="topColor" />
                            <feComposite in="topColor" in2="topInner" operator="in" result="topInnerColored" />

                            {/* Bottom inner shadow */}
                            <feOffset dx="0" dy="0" result="bottomOffset" />
                            <feGaussianBlur in="SourceAlpha" stdDeviation="1.67" result="bottomBlur" />
                            <feComposite in="bottomBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="bottomInner" />
                            <feFlood floodColor="#6f6767" floodOpacity="1" result="bottomColor" />
                            <feComposite in="bottomColor" in2="bottomInner" operator="in" result="bottomInnerColored" />

                            {/* Outer stroke shadow */}
                            <feMorphology in="SourceAlpha" operator="dilate" radius="1.5" result="dilated" />
                            <feGaussianBlur in="dilated" stdDeviation="2" result="blurOuter" />
                            <feFlood floodColor="#000000" floodOpacity="0.2" result="outerShadowColor" />
                            <feComposite in="outerShadowColor" in2="blurOuter" operator="in" result="outerShadow" />

                            {/* Merge all effects */}
                            <feMerge>
                                <feMergeNode in="outerShadow" />
                                <feMergeNode in="topInnerColored" />
                                <feMergeNode in="bottomInnerColored" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>

                {/* Circle with gradient, Y-axis inner shadows, and outer stroke shadow */}
                <circle
                    cx={center}
                    cy={center}
                    r={90}
                    fill="url(#circleGradient)"
                    stroke={isDialDisabled ? "#222" : "#000000"}
                    strokeWidth="2.5"
                    filter="url(#outerCircleShadow)"
                />

                <circle
                    cx={center}
                    cy={center}
                    r={91.5}
                    fill="none"
                    stroke={isDialDisabled ? "#222" : "#59595925"}
                    strokeWidth="0.5"
                    filter="url(#outerCircleShadow)"
                />

                {/* Track (gray background arc) */}
                <circle
                    cx={center}
                    cy={center}
                    r={trackRadius}
                    fill="none"
                    stroke={isDialDisabled ? "#2a2a2a" : "#312F2F"}
                    strokeWidth="13.33"
                    strokeDasharray={`${2 * Math.PI * trackRadius * 0.75} ${2 * Math.PI * trackRadius * 0.25}`}
                    transform={`rotate(135 ${center} ${center})`}
                    // strokeLinecap="round"
                    className="inset-shadow-sm"
                />

                {/* Progress (gradient arc) */}
                <circle
                    cx={center}
                    cy={center}
                    r={trackRadius}
                    fill="none"
                    // stroke={
                    //     isDialDisabled ? "#27ae5f36" : "#27AE60"

                    //     // if runMode === 0 (off), use a dimmed green - 
                    //     // if runMode === 1 (heat), use a dimmed yellow
                    // }
                    stroke={
                        isDialDisabled 
                            ? `${modeColor}36`       // Dimmed, transparent shade
                            : modeColor              // Full color when allowed
                    }
                    strokeWidth="13.33"
                    strokeDasharray={`${2 * Math.PI * trackRadius}`}
                    strokeDashoffset={`${2 * Math.PI * trackRadius * (1 - percentage * 0.75)}`}
                    transform={`rotate(135 ${center} ${center})`}
                    // strokeLinecap="round"
                />

                {/* Tick marks around the dial in the circle */}
                {Array.from({ length: 19 }, (_, i) => {
                    const angle = 135 + (i / 18) * 270;
                    const rad = (angle * Math.PI) / 180;
                    const innerR = 69;
                    const outerR = 77;
                    const x1 = center + Math.cos(rad) * innerR;
                    const y1 = center + Math.sin(rad) * innerR;
                    const x2 = center + Math.cos(rad) * outerR;
                    const y2 = center + Math.sin(rad) * outerR;
                    return (
                        <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={isDialDisabled ? "#333" : "#27AE60"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    );
                })}

                {/* Inner circle */}
                <svg style={{ position: "absolute", width: 0, height: 0 }}>
                    <defs>
                        <filter id="circleShadow" x="-50%" y="-50%" width="200%" height="200%">
                        
                        {/* <!-- Drop shadow --> */}
                        <feDropShadow dx="0" dy="0" stdDeviation="11.67" floodColor="#000000" floodOpacity="0.25" />

                        {/* <!-- Inner shadow --> */}
                        <feOffset dx="0" dy="0" result="offsetInner" />
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3.33" result="blurInner" />
                        <feComposite in="blurInner" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="innerShadow" />
                        <feFlood floodColor="#000000" floodOpacity="0.38" result="colorInner" />
                        <feComposite in="colorInner" in2="innerShadow" operator="in" result="innerShadowColored" />

                        {/* <!-- Merge shadows and original circle --> */}
                        <feMerge>
                            <feMergeNode in="innerShadowColored" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                        </filter>
                    </defs>
                </svg>

                {/* Power On Off */}
                <svg 
                    width={2 * center} 
                    height={2 * center} 
                    onClick={onClick}
                >
                    {/* Circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={45}
                        fill="#232323"
                        stroke={disabled ? "#222" : "#FFFFFF1F"}
                        strokeWidth="1.25"
                        filter="url(#circleShadow)"
                    />

                    {/* Center Power icon using foreignObject */}
                    <foreignObject
                        x={center - 20} // half of icon size
                        y={center - 20}
                        width={41}
                        height={41}
                    >
                        <div
                            style={{
                                width: "41px",
                                height: "41px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                            }}
                        >
                            {isLoading ? 
                            <Loader size={40} className="animate-spin" /> : 
                            (
                                <Power
                                    color={isDialDisabled ? "#555" : "#FFFFFF"}
                                    size={40}
                                    className="hover:scale-110 transition-all duration-300 w-full h-full rounded-full flex items-center justify-center"
                                />
                            )}
                        </div>
                    </foreignObject>
                </svg>

                {/* Thumb (yellow dot) */}
                <circle
                    cx={center + Math.cos(((135 + percentage * 270) * Math.PI) / 180) * trackRadius}
                    cy={center + Math.sin(((135 + percentage * 270) * Math.PI) / 180) * trackRadius}
                    r={10}
                    fill={isDialDisabled ? "#666" : "#FFFF00"}
                />
            </svg>
        </div>
    );
}