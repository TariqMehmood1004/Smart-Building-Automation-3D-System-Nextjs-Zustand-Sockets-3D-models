
"use client";

import THvacStatusIcon from "@/components/Icons/THvacStatusIcon";
import Image from "next/image";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import React from "react";

export default function ModelViewer() {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [size, setSize] = React.useState("md");

  const handleOpen = (size: any) => {
    setSize(size);
    onOpen();
  };
  
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Image
        src="/images/delta/floors/floor-1.jpg"
        alt="3D Model"
        width={1000}
        height={1000}
        className="w-full h-full object-cover"
        priority
        quality={100}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading="eager"
        unoptimized
      />

      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <div className="absolute top-20 left-[55%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
        
          <div className="shadow-lg bg-black p-2 rounded-full cursor-pointer hover:scale-110 ease-in-out duration-300">
            <THvacStatusIcon
              width={25}
              height={25}
              activeStatus="Dry"
              onClick={() => handleOpen(size)}
            />
          </div>
          <span className="flex flex-col items-center bg-black p-1 px-2 rounded-md">
            <p className="text-white text-[10px] font-semibold">25°C</p>
          </span>
        </div>
      </div>

      <Drawer isOpen={isOpen}  size={"lg"} className="w-full h-full p-7 bg-transparent border-none focus:outline-none outline-none" onClose={onClose}>
        <DrawerContent>
          {(onClose) => (
            <>
            <div className="w-full h-full p-6 bg-[#161616] border border-[#0D8FAC] relative">
              <div
                className="w-2.5 h-2.5 bg-[#0D8FAC] absolute top-0 left-1/2 -translate-x-1/2"
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)'
                }}
              >
                <span className="w-2.5 h-2.5 bg-[#0D8FAC]"></span>
              </div>

              <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute top-0 left-0"></span>
              <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute top-0 right-0"></span>
              <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute bottom-0 right-0"></span>
              <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute bottom-0 left-0"></span>
              
              <div
                className="w-2.5 h-2.5 bg-[#0D8FAC] absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                }}
              >
                <span className="w-2.5 h-2.5 bg-[#0D8FAC]"></span>
              </div>

              {/* <DrawerHeader className="flex flex-col gap-1">Drawer Title</DrawerHeader> */}
              <DrawerBody>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                  risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                  quam.
                </p>
                <p>
                  Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit dolor
                  adipisicing. Mollit dolor eiusmod sunt ex incididunt cillum quis. Velit duis sit
                  officia eiusmod Lorem aliqua enim laboris do dolor eiusmod.
                </p>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </DrawerFooter>
            </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
