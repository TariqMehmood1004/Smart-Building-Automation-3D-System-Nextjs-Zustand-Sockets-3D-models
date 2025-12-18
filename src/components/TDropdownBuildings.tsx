"use client";

import React, { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { BadgeCheck, ChevronDown } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";


const cities = [
  {
    label: "Delta 9",
    value: "delta-9",
    image: "/images/delta/delta-9.png",
    paragraph: "Click to view all the details of delta 9.",
    floors: [
      {
        label: "Ground Floor",
        value: "ground-floor",
        paragraph: "You can view all the data of lobby 1 / Ground floor.",
      },
      {
        label: "First Floor",
        value: "first-floor",
        paragraph: "You can view all the data of lobby 2 / First floor.",
      },
    ],
    url: "/delta-9",
  },
];


export default function TDropdownBuildings() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set([cities[0].value])
  );
  const pathname = usePathname(); // Get current URL
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const router = useRouter();

  const selectedValue = React.useMemo(
    () => Array.from(selectedKeys).join(", ").replace(/_/g, ""),
    [selectedKeys]
  );

  const handleFloorClick = (floorValue: string) => {
    router.push(`/delta-9/${floorValue}`);
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          className="capitalize flex items-center gap-2 px-4 rounded text-[18px] text-[#A1A5A3]"
          variant="bordered"
        >
          <ChevronDown size={18} />
          <span>{selectedValue || "Buildings"}</span>
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        hideSelectedIcon
        disallowEmptySelection
        aria-label="Select building"
        selectedKeys={selectedKeys}
        selectionMode="single"
        variant="flat"
        className="w-[380px] text-[16px] font-normal bg-[#151C18] text-[#A1A5A3] rounded-lg mt-4 py-5 px-3 shadow-lg"
        onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
      >
        {cities.map((city) => (
          <DropdownItem
            key={city.value}
            value={city.value}
            textValue={city.label}
            onMouseEnter={() => setHoveredCity(city.value)}
            onMouseLeave={() => setHoveredCity(null)}
            selectedIcon={null} // hides the check icon
            onClick={() => {
              setSelectedKeys(new Set([city.value]));
              router.push(city.url);
            }}
            className="hover:bg-[#272727]/60 rounded-lg py-2 px-2 cursor-pointer transition-all duration-300 border border-transparent hover:border-[#373737]/80 group relative"
          >
            <div className="w-full mb-2 flex items-center justify-between gap-4">
              <div>
                {city.image ? (
                  <Image
                    src={city.image}
                    alt={city.label}
                    width={70}
                    height={70}
                    className="rounded"
                  />
                ) : null}
              </div>
              <div>
                <span className="font-semibold text-[18px]">{city.label}</span>
                <p className="text-[12px]">{city.paragraph}</p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center gap-2 border border-[#373737] group-hover:border-[#373737] transition-all duration-300">
                <BadgeCheck
                  size={32}
                  className={`duration-300 text-[#A1A5A3] transition-all ${
                    pathname.startsWith(city.url) ? "block" : "hidden"
                  }`}
                />
              </div>
            </div>

            {/* Floors submenu */}
            {hoveredCity === city.value && city.floors.length > 0 && (
              <div className="absolute top-0 left-full ml-4 p-2 w-[300px] bg-[#151C18] text-[#A1A5A3] rounded-lg shadow-lg py-3 px-3 z-50">
                {/* heading */}
                <h2 className="font-semibold text-[18px] py-2">Lobby / Floors</h2>
                {city.floors.map((floor) => (
                  <div
                    key={floor.value}
                    onClick={(e) => {
                      e.stopPropagation(); // prevent DropdownItem click

                      console.log("Delta clicked:", city.value);
                      console.log("Floor clicked:", floor.value);
                      
                      handleFloorClick(floor.value);
                    }}
                    className="hover:bg-[#272727]/60 flex items-center gap-3 rounded-lg py-2 px-2 cursor-pointer transition-all duration-200"
                  >
                    <div>
                      <span className="font-semibold">{floor.label}</span>
                      <p className="text-[12px]">{floor.paragraph}</p>
                    </div>
                    
                    <BadgeCheck
                      size={24}
                      className={`text-[#A1A5A3] ${
                        pathname === `${city.url}/${floor.value}` ? "block" : "hidden"
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
