"use client";

import React from "react";
import TIconButton from "./TIconButton";
import { AlignLeft, ArrowLeft } from "lucide-react";
import TDropdown from "./TDropdown";
import TDropdownBuildings from "./TDropdownBuildings";
import TUserProfile from "./TUserProfile";
import { usePathname, useRouter } from "next/navigation";


const THeader = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <section className="flex items-center justify-center gap-8 absolute top-0 left-0 right-0 z-[998] w-full h-16 mt-8">
      
      {/* Back button if not root ("/") */}
      {pathname !== "/" && (
        <TIconButton icon={ArrowLeft} onClick={() => router.back()} />
      )}

      <div className="text-2xl font-bold text-white w-[80%] h-full bg-[#151C18] rounded-[10px] px-3 py-1.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <TIconButton icon={AlignLeft} onClick={() => {}} />
          <TDropdown />
          <hr className="w-0.5 h-4 bg-[#A1A5A3]" />
          <TDropdownBuildings />
        </div>

        <div>
          <TUserProfile />
        </div>
      </div>


    </section>
  );
};

export default THeader;
