"use client";

import { Button } from "@heroui/button";
import { ReactNode } from "react";

interface Props {
  className?: string;
  children: ReactNode;   // Accept anything inside
  onClick?: () => void;
}

export default function TButton({ className, children, onClick }: Props) {
  return (
    <Button
      className={`${className} w-fit px-2 py-1 h-12 flex items-center justify-center bg-[#2D3430] hover:bg-[#444946] rounded-lg text-[#A1A5A3] transition-all duration-300`}
      isIconOnly
      aria-label="TIcon Button"
      color="warning"
      variant="faded"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
