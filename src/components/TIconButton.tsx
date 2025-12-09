"use client";

import { Button } from "@heroui/button";
import { ComponentType } from "react";

interface Props {
  className?: string;
  icon: ComponentType<{ size?: number }>;
  onClick?: () => void;
}

export default function TIconButton({ className, icon: Icon, onClick }: Props) {
  return (
    <Button
      className={`${className} w-12 h-12 flex items-center justify-center bg-[#2D3430] hover:bg-[#444946] rounded-lg text-[#A1A5A3] transition-all duration-300`}
      isIconOnly
      aria-label="TIcon Button"
      color="warning"
      variant="faded"
      onClick={onClick}
    >
      <Icon size={24} />
    </Button>
  );
}
