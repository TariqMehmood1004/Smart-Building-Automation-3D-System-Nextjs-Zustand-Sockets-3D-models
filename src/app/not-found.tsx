"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative overflow-hidden flex items-center justify-center min-h-screen transition-colors duration-300 px-4 bg-[#2F2F30]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2F2F30]/20 via-[#2D3430]/20 to-[#2F2F30]/60 animate-gradient" />

      <div className="relative text-center max-w-md">
        <h1 className="text-6xl font-extrabold text-blue-500 mb-4 tracking-tight">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-100 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-300 mb-6">
          Oops! We could not find the page you were looking for.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-[#212824] hover:bg-[#444946] cursor-pointer transition-all duration-300 text-[#A1A5A3]"
        >
          Return Home
        </Link>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-20px, -20px) scale(1.05);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        .animate-gradient {
          animation: gradient 10s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
