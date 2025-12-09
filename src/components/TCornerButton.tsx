"use client";

import { Button } from "@heroui/button";
import type { ButtonProps } from "@heroui/button";
import { LucideProps } from "lucide-react";
import { ReactNode } from "react";

interface TCornerButtonProps extends ButtonProps {
  text?: string;
  textSize?: string;
  icon?: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>> | ReactNode;
  image?: string;
  borderColor?: string;
  isBorderActive?: boolean;
  isLoading?: boolean;
  bgColor?: string;
  textColor?: string;
  width?: string;
  height?: string;
  isActive?: boolean;
}

export default function TCornerButton({
  text,
  textSize = "text-lg",
  icon,
  image,
  borderColor = "#179BB9",
  isBorderActive = false,
  isLoading = false,
  bgColor = "#2d2c31",
  textColor = "#D2D7DF",
  width = "w-16",
  height = "h-9",
  className = "",
  isActive = false,
  ...props
}: TCornerButtonProps) {
  return (
    <Button
      className={
        `
          block w-full
          ${width || ""} 
          ${height || ""}
          relative flex flex-col items-center justify-center gap-2
          ${className || ""}
        ` as string
      }
      style={{
        backgroundColor: bgColor || "",
        color: textColor || "",
      }}
      {...props}
    >
      {/* Content */}
      <div className="flex flex-col items-center gap-2">
        {icon && <span className="text-xl">{icon as string}</span>}
        {image && <img src={image} alt="icon" className="w-6 h-6" />}
        {text && <span className={`${textSize || ""} font-semibold`}>{text}</span>}
      </div>

      {/* Corners | isActive=true | isLoading=false */}
      <>        
        {isActive && (
          <>
            {/* Top Right */}
            <div
              className="absolute top-0 right-0 z-[999] w-3 h-3"
              style={{
                backgroundColor: borderColor,
                clipPath: 'polygon(0 0, 100% 100%, 100% 0)',
              }}
            />

            {/* Bottom Left */}
            <div
              className="absolute bottom-0 left-0 z-[999] w-3 h-3"
              style={{
                backgroundColor: borderColor,
                clipPath: 'polygon(0 0, 0 100%, 100% 100%, 12% 0)',
              }}
            />

            {/* Bottom Right */}
            <div
              className="absolute bottom-0 right-0 z-[999] w-3 h-3"
              style={{
                backgroundColor: borderColor,
                clipPath: 'polygon(100% 0, 0 88%, 100% 100%)',
              }}
            />

            {/* Top Left */}
            <div
              className="absolute top-0 left-0 z-[999] w-3 h-3"
              style={{
                backgroundColor: borderColor,
                clipPath: 'polygon(0 0, 0 100%, 100% 0)',
              }}
            />
          </>
        )}

        {!isBorderActive && (
          <>
            <div className={`absolute top-0 left-0 ${isActive || isLoading ? 'w-full h-full' : 'w-2 h-2'} transition-all ease-in-out duration-300`} style={{ borderLeft: `2px solid ${borderColor}`, borderTop: `2px solid ${borderColor}` }}></div>            
            <div className={`absolute top-0 right-0 ${isActive || isLoading ? 'w-full h-full' : 'w-2 h-2'} transition-all ease-in-out duration-300`} style={{ borderRight: `2px solid ${borderColor}`, borderTop: `2px solid ${borderColor}` }}></div>
            <div className={`absolute bottom-0 left-0 ${isActive || isLoading ? 'w-full h-full' : 'w-2 h-2'} transition-all ease-in-out duration-300`} style={{ borderLeft: `2px solid ${borderColor}`, borderBottom: `2px solid ${borderColor}` }}></div>
            <div className={`absolute bottom-0 right-0 ${isActive || isLoading ? 'w-full h-full' : 'w-2 h-2'} transition-all ease-in-out duration-300`} style={{ borderRight: `2px solid ${borderColor}`, borderBottom: `2px solid ${borderColor}` }}></div>
          </>
        )}
      </>
    </Button>
  );
}
