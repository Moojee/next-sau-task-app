"use client";

import Image from "next/image";
import task from "./../assets/images/task.png";
import Link from "next/link";
// import Footer if needed, but usually Landing page is clean.

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F5F5FA] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* =============================================
          Background Decor (วงกลมสีฟุ้งๆ สร้างบรรยากาศ)
          ============================================= */}
      <div className="absolute top-[-10%] right-[-20%] w-[400px] h-[400px] bg-[#EBEBFF] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#FFE8E8] rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* =============================================
          Main Content Container
          ============================================= */}
      <div className="z-10 flex flex-col items-center px-8 text-center max-w-md w-full">
        {/* 1. Hero Image */}
        <div className="relative mb-10 group cursor-pointer">
          {/* แสงฟุ้งหลังรูป */}
          <div className="absolute inset-0 bg-white/60 rounded-full blur-2xl scale-110 group-hover:scale-125 transition-transform duration-500" />

          <Image
            src={task}
            alt="Task App Logo"
            width={220}
            className="relative drop-shadow-2xl transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-3"
          />
        </div>

        {/* 2. Headlines */}
        <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">
          Mini Task <span className="text-[#4B4CED]">App</span>
        </h1>

        <p className="text-slate-400 text-lg mb-12 leading-relaxed">
          บริหารจัดการงานที่ทำในแต่ละวัน
        </p>

        {/* 3. CTA Button (ปุ่มเริ่มใช้งาน) */}
        <Link
          href="/alltask"
          className="w-full bg-[#4B4CED] hover:bg-[#3f40d6] text-white py-4 rounded-2xl 
                     font-bold text-lg shadow-xl shadow-indigo-200 
                     transition-all duration-300 hover:shadow-indigo-300 hover:-translate-y-1 active:translate-y-0
                     flex items-center justify-center gap-3 group"
        >
          <span>Get Started</span>
          {/* Arrow Icon */}
          <svg
            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </div>

      {/* =============================================
          Simple Footer Text
          ============================================= */}
      <div className="absolute bottom-6 text-xs text-slate-300 font-medium">
        © 2025 Mini Task App by Moojeefilm
      </div>
    </div>
  );
}
