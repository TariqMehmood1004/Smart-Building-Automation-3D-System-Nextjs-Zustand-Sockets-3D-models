"use client";

import React, { useRef, useState } from "react";
import { Button } from "@heroui/button";
import { X, Power, PowerOff, Loader } from "lucide-react";
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/react";
import { useHvacSystemStore } from "@/stores/HvacSystemStore";

interface Props {
  title?: string;
  powerOnIcon?: React.ReactNode;
  powerOffIcon?: React.ReactNode;
}

export default function TTrendHvacAcquisitionsGroupedControll({
  title = "HVAC Control",
  powerOnIcon = null,
}: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = useRef<HTMLDivElement>(null);

  const { isHvacLoading, fetchHvacData } = useHvacSystemStore();
  const [powerOn, setPowerOn] = useState(false);

  const handlePowerToggle = async () => {
    try {
      // Call API first
      await fetchHvacData([
        "1:COM1-0-9-1-E",
        "1:COM1-0-9-2-E", // dynamic devices
      ]);

      // ✅ Only update state if request succeeds
      setPowerOn((prev) => !prev);
    } catch (error) {
      console.error("❌ Failed to toggle power:", error);
    }
  };

  return (
    <>
      {/* Main Button: Opens Modal */}
      <Button
        radius="md"
        onPress={onOpen}
        className="w-20 h-20 rounded-full shadow-2xl bg-zinc-900 hover:bg-zinc-900/80 flex text-white items-center justify-center transition-all duration-300"
      >
        {powerOnIcon}
      </Button>

      {/* HVAC Modal */}
      <Modal
        ref={targetRef}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        backdrop="blur"
        hideCloseButton
        classNames={{
          wrapper:
            "fixed inset-0 bg-neutral-500/25 backdrop-blur-lg transition-all duration-300 z-50 flex items-center justify-center p-4",
          base: "flex items-center justify-center",
        }}
      >
        <ModalContent className="bg-[#151C18] text-[#A1A5A3] max-w-lg max-h-[50vh] overflow-hidden rounded-lg flex flex-col gap-4 shadow-lg shadow-slate-500/20">
          {(onClose) => (
            <>
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute cursor-pointer top-4 right-4 flex items-center justify-center rounded-full bg-[#2F2F30] p-2 text-[#A1A5A3] hover:bg-[#2F2F30]/40 hover:text-white transition"
              >
                <X size={22} />
              </button>

              {/* Modal Header */}
              <ModalHeader className="w-full p-5 bg-[#272727] text-white text-lg font-semibold border-b border-[#3B3A3A] pb-4.5">
                {title}
              </ModalHeader>

              {/* Modal Body */}
              <ModalBody className="px-5 py-8 w-full flex flex-col gap-6">
                {/* Power Toggle */}
                <div className="flex justify-center">
                  <Button
                    onPress={handlePowerToggle}
                    className="w-20 h-20 flex items-center justify-center rounded-full border border-[#3B3A3A] text-[#A1A5A3] cursor-pointer hover:bg-[#3B3A3A] hover:text-white transition-all duration-300"
                  >
                    {isHvacLoading ? (
                      <Loader size={30} color="red" className="animate-spin" />
                    ) : powerOn ? (
                      <Power size={30} />
                    ) : (
                      <PowerOff size={30} />
                    )}
                  </Button>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
