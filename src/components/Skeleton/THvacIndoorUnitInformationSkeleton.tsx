"use client";

export default function THvacIndoorUnitInformationSkeleton() {
  return (
    <section className="absolute inset-0 w-full min-h-screen animate-pulse">
      {/* Background placeholder */}
      <div className="absolute inset-0 -z-10 bg-gray-200" />

      <div className="absolute top-0 left-0 w-full min-h-screen gap-4 text-[#A1A5A3]">
        {/* Card 1 */}
        <div className="absolute bottom-[30%] left-[33%] w-[30rem] p-5 rounded-lg gap-4 grid grid-cols-2 items-center justify-between bg-white/20 backdrop-blur-sm">
          <div className="h-20 w-20 bg-gray-300 rounded-lg" />
          <div className="h-20 w-20 bg-gray-300 rounded-lg" />
          <div className="col-span-2 h-10 w-full bg-gray-300 rounded-md" />
          <div className="col-span-2 h-20 w-full bg-gray-300 rounded-lg" />
        </div>

        {/* Card 2 */}
        <div className="absolute bottom-[33%] left-[62%] p-5 rounded-lg grid grid-cols-2 gap-4 bg-white/20 backdrop-blur-sm">
          <div className="h-20 w-20 bg-gray-300 rounded-lg" />
        </div>

        {/* Card 3 */}
        <div className="absolute bottom-[55%] left-[61%] p-5 rounded-lg grid grid-cols-2 gap-4 bg-white/20 backdrop-blur-sm">
          <div className="h-20 w-20 bg-gray-300 rounded-lg" />
        </div>
      </div>
    </section>
  );
}
