"use client";

import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Selection,
} from "@heroui/react";
import { ChevronDown } from "lucide-react";

const cities = [
  { label: "Lahore", value: "lahore" },
  { label: "Islamabad", value: "islamabad" },
  { label: "Karachi", value: "karachi" },
];

export default function TDropdown() {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set([cities[0].value])
  );

  const selectedValue = React.useMemo(
    () => Array.from(selectedKeys).join(", ").replace(/_/g, ""),
    [selectedKeys]
  );

  return (
    <Dropdown className="text-[#A1A5A3]">
      <DropdownTrigger>
        <Button
          className="capitalize flex items-center gap-2 bg-[#2D3430] px-4 py-2 rounded text-[18px] text-[#A1A5A3]"
          variant="bordered"
        >
          <ChevronDown size={18} />
          <span>{selectedValue}</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Single selection example"
        selectedKeys={selectedKeys}
        selectionMode="single"
        variant="flat"
        className="w-[200px] flex flex-col gap-2 text-[16px] font-normal bg-[#151C18] text-[#A1A5A3] rounded-lg mt-4"
        onSelectionChange={setSelectedKeys}
      >
        {cities.map((city) => (
          <DropdownItem key={city.value}>{city.label}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
