import React, { useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Fan, HeaterIcon, SunSnow } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Selection,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import { X } from "lucide-react";
import TVolumeControl from "./TColumeControl";
import THvacValueNumber from "./THvacValueNumber";



const options = [
  { label: "Cool", value: "cool", icon: <SunSnow size={18} /> },
  { label: "Heat", value: "heat", icon: <HeaterIcon size={18} /> },
  { label: "Fan", value: "fan", icon: <Fan size={18} /> },
];

const controllers = [
  { label: "Individual", value: "Individual" },
  { label: "Master", value: "Master" },
];


interface Option {
  title?: string;
  iconImage?: React.ReactNode;
}

export default function TTrendHvacAcquisitions({ iconImage = null, title = "Modal Title here" }: Option) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const targetRef = React.useRef(null);

  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set([options[0].value])
  );

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", ").replace(/_/g, ""),
    [selectedKeys]
  );

  const [selectedController, setSelectedController] = useState<Selection>(
    new Set([controllers[0].value])
  );

  const selectedControllerValue = useMemo(
    () => Array.from(selectedController).join(", ").replace(/_/g, ""),
    [selectedController]
  );

  return (
    <>
      <Button
        radius="md"
        onPress={onOpen}
        className="w-[5rem] h-[5rem] p-3 px-4 rounded-[10px] shadow-2xl
                         bg-blue-400 hover:bg-blue-500 transition-all duration-300
                         text-left"
      >
        <div className="text-[18px] font-semibold text-white mb-1 rounded-lg flex flex-col items-center justify-center">
          {iconImage}
        </div>
      </Button>


      <Modal
        ref={targetRef}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        backdrop="blur"
        hideCloseButton
        classNames={{
          wrapper: "fixed inset-0 bg-slate-800/25 backdrop-blur-sm transition-all duration-300 z-50 flex items-center justify-center p-4", // full-screen wrapper
          base: "flex items-center justify-center",   // modal container
        }} >
        <ModalContent className="bg-[#151C18] text-[#A1A5A3] max-w-xl max-h-[50vh] overflow-hidden rounded-lg gap-4 flex items-start shadow-lg shadow-slate-500/20">
          {(onClose) => (
            <>
              <button
                onClick={onClose}
                className="absolute cursor-pointer top-4 right-4 text-[#A1A5A3] hover:text-white transition bg-[#2F2F30] hover:bg-[#2F2F30]/40 p-2 rounded-full flex items-center justify-center"
              >
                <X size={22} />
              </button>

              <ModalHeader as="h4" className="w-full p-5 bg-[#272727] text-white text-lg font-semibold border-b border-[#3B3A3A] pb-4.5">
                {title}
              </ModalHeader>

              <ModalBody className="px-5 py-8 flex items-center justify-center w-full">
                <ul className="flex items-center justify-center gap-5 mt-2 text-[16px] text-[#A1A5A3]">
                  <li className="flex flex-col items-center justify-between gap-3">
                    <TVolumeControl />
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          className="capitalize border border-[#3B3A3A] flex items-center gap-2 px-4 py-2 rounded text-[16px] text-[#A1A5A3]"
                          variant="bordered"
                        >
                          {options.find((o) => o.value === selectedValue)?.icon}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        disallowEmptySelection
                        aria-label="Select mode"
                        selectedKeys={selectedKeys}
                        selectionMode="single"
                        variant="flat"
                        className="w-[200px] flex flex-col gap-1 bg-[#151C18] text-[#A1A5A3] rounded-lg mt-2"
                        onSelectionChange={setSelectedKeys}
                      >
                        {options.map((opt) => (
                          <DropdownItem
                            key={opt.value}
                            value={opt.value}
                            className="flex items-center gap-2 text-[16px]"
                          >
                            <div className="flex items-center gap-2 text-[16px]">
                              <span>{opt.icon}</span>
                              <span>{opt.label}</span>
                            </div>
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </li>

                  <li className="min-h-42 flex flex-col items-center justify-between gap-3 rounded-lg">
                    <THvacValueNumber />
                  </li>
                </ul>

                <div>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        className="capitalize w-36 bg-blue-500/15 text-orange-500/70 border border-blue-500/25 flex items-center gap-2 px-4 py-2 rounded-full text-[16px]"
                        variant="bordered"
                      >
                        {controllers.find((o) => o.value === selectedControllerValue)?.value}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      disallowEmptySelection
                      aria-label="Select mode"
                      selectedKeys={selectedKeys}
                      selectionMode="single"
                      variant="flat"
                      className="w-[200px] flex flex-col gap-1 bg-[#373737] text-[#A1A5A3] rounded-lg mt-2"
                      onSelectionChange={setSelectedController}
                    >
                      {controllers.map((opt) => (
                        <DropdownItem
                          key={opt.value}
                          value={opt.value}
                          className="flex items-center gap-2 text-[16px]"
                        >
                          <div className="flex items-center gap-2 text-[16px]">
                            <span>{opt.label}</span>
                          </div>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

