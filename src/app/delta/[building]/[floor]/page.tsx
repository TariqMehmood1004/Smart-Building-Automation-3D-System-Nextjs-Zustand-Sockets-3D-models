// src/app/delta/[building]/[floor]/page.tsx
"use client";

import THvacIndoorUnitInformationSkeleton from "@/components/Skeleton/THvacIndoorUnitInformationSkeleton";
import TTrendHvacAcquisitions from "@/components/TTrendHvacAcquisitions";
import TTrendHvacAcquisitionsGroupedControll from "@/components/TTrendHvacAcquisitionsGroupedControll";
import { useHvacSystemStore } from "@/stores/HvacSystemStore";
import { Power, PowerOff } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function FloorPage() {
  const params = useParams<{ building: string; floor: string }>();
  const {
    indoorDevices,
    getHvacData,
    isHvacLoading,
    getIndividualDevice,
    indoorUnitInformationTypes
  } = useHvacSystemStore();

  useEffect(() => {
    getHvacData();
  }, [getHvacData]);

  const list_of_all_device_sn = indoorDevices.map((device) => device.deviceSn);
  console.log("list_of_all_device_sn", list_of_all_device_sn);

  useEffect(() => {
    if (indoorDevices.length === 0) return;
    const idu = getIndividualDevice(list_of_all_device_sn);
    console.log("idu", idu);
  }, [getIndividualDevice, indoorDevices.length, list_of_all_device_sn, indoorUnitInformationTypes]);

  return (
    <>
      {isHvacLoading ? <THvacIndoorUnitInformationSkeleton /> :
        <section className="absolute inset-0 w-full min-h-screen">
          {/* Background Image */}
          <div className="absolute inset-0 -z-10">
            <Image
              src="/images/delta/floors/floor-1.jpg"
              alt={`${params.floor}`}
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
          </div>

          {/* Coffee Planet Layer Card */}
          <div className="absolute top-0 left-0 w-full min-h-screen gap-4 text-[#A1A5A3]">
            <div className="absolute bottom-[30%] left-[33%] w-[30rem] p-5 rounded-lg gap-4 grid grid-cols-2 items-center justify-between">

              {/* 🔹 First Dynamic Controller */}
              {indoorUnitInformationTypes.length > 0 && (
                <div className="flex items-center justify-center">
                  <TTrendHvacAcquisitions
                    title={`Location address = ${indoorUnitInformationTypes[0].device_sn} AC`}
                    iconImage={
                      <Image
                        src="/icons/cassette-ac.jpg"
                        alt={indoorUnitInformationTypes[0].device_name}
                        width={100}
                        height={100}
                        className="rounded-lg"
                      />
                    }
                  />
                </div>
              )}

              {/* 🔹 Middle Static Controller */}
              <div className="flex items-center justify-center gap-3 col-span-2 w-full py-2">
                <TTrendHvacAcquisitionsGroupedControll
                  title={`Main Lobby Controller`}
                  powerOnIcon={<Power size={24} />}
                  powerOffIcon={<PowerOff size={24} />}
                />
              </div>

              {/* 🔹 Last Dynamic Controller */}
              {indoorUnitInformationTypes.length > 0 && (
                <div className="flex items-center justify-center">
                  <TTrendHvacAcquisitions
                    title={`Location address = ${indoorUnitInformationTypes[indoorUnitInformationTypes.length - 1].device_sn} AC`}
                    iconImage={
                      <Image
                        src="/icons/cassette-ac.jpg"
                        alt={indoorUnitInformationTypes[indoorUnitInformationTypes.length - 1].device_name}
                        width={45}
                        height={45}
                        className="rounded-lg"
                      />
                    }
                  />
                </div>
              )}

              {/* HVAC Fancy Card appear on click */}
            </div>


            <div className="absolute bottom-[33%] left-[62%] p-5 rounded-lg gap-4 grid grid-cols-2 items-center justify-between">

              <div className="flex items-center justify-center">
                <TTrendHvacAcquisitions title={`Location address = Room 4115 AC`} iconImage={<Image src="/icons/cassette-ac.jpg" alt={`${params.floor}`} width={45} height={45} className="rounded-lg" />} />
              </div>
              {/* HVAC Fancy Card appear on click*/}
            </div>

            <div className="absolute bottom-[55%] left-[61%] p-5 rounded-lg gap-4 grid grid-cols-2 items-center justify-between">

              <div className="flex items-center justify-center">
                <TTrendHvacAcquisitions title={`Location address = Room 4114 AC`} iconImage={<Image src="/icons/cassette-ac.jpg" alt={`${params.floor}`} width={45} height={45} className="rounded-lg" />} />
              </div>
              {/* HVAC Fancy Card appear on click*/}
            </div>
          </div>
        </section>
      }
    </>
  );
}
