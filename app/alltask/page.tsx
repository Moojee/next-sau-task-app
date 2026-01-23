"use client";

import Image from "next/image";
import Link from "next/link";
// ผมสมมติว่าคุณมีรูป profile.jpg ใน assets ถ้าไม่มีมันจะโชว์เป็นสีพื้นแทน
import profilePic from "./../../assets/images/profile.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// =============================================
// Type Definition
// =============================================
type Task = {
  id: string;
  created_at: string;
  title: string;
  detail: string;
  image_url: string | null;
  is_completed: boolean;
  update_at: string | null;
};

export default function Page() {
  // =============================================
  // State Management
  // =============================================
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  // =============================================
  // Data Fetching
  // =============================================
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("task_tb")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error.message);
      } else if (data) {
        setTasks(data as Task[]);
      }
      setLoading(false);
    };
    fetchTasks();
  }, []);

  // =============================================
  // Statistics Logic
  // =============================================
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const pendingTasks = tasks.filter((t) => !t.is_completed).length;
  const newTasks = tasks.filter((t) => {
    const taskDate = new Date(t.created_at);
    const now = new Date();
    const diffHours = (now.getTime() - taskDate.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  }).length;

  // =============================================
  // Helper: Image Validation
  // =============================================
  const resolveImageSrc = (src?: string | null) => {
    if (!src) return null;
    const s = src.trim();
    return s.startsWith("http") || s.startsWith("/") ? s : null;
  };

  // =============================================
  // Helper: Date Formatting
  // =============================================

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString("en-US", {
      day: "numeric", // วันที่ (13)
      month: "short", // เดือนแบบย่อ (Jan)
      year: "numeric", // ปีแบบย่อ (24 / 67) (ถ้าไม่อยากโชว์ปี ลบบรรทัดนี้ได้ครับ)
      hour: "numeric", // ชั่วโมง
      minute: "2-digit", // นาที
      hour12: true, // true = มี AM/PM, false = 24 ชม.
    });
  };

  // =============================================
  // Handlers
  // =============================================
  const handleDelete = async (id: string) => {
    if (!window.confirm("ลบงานนี้ใช่ไหม?")) return;
    const { error } = await supabase.from("task_tb").delete().eq("id", id);
    if (!error) setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.is_completed;
    if (filter === "completed") return t.is_completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F5FA] font-sans pb-28">
      {/* =============================================
          1. Header Section (Like UI)
          ============================================= */}
      <div className="px-6 pt-12 pb-6 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm md:static md:bg-transparent md:shadow-none">
        <div className="flex items-center gap-3">
          {/* Profile Circle */}
          <div className="w-12 h-12 rounded-full bg-yellow-300 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
            <span className="text-2xl">👩🏻‍💻</span>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Hello,</p>
            <h1 className="text-xl font-bold text-slate-800">Moojee!</h1>
          </div>
        </div>
        <div className="flex gap-3">
          {/* Fake Icons */}
          <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
            ⚙️
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm relative">
            🔔
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        {/* =============================================
            2. Hero Text
            ============================================= */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-800 leading-tight">
            Start today's <br /> tasks.
          </h2>
        </div>

        {/* =============================================
            3. Stats Grid (2x2 Layout)
            ============================================= */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Card 1: Today/New */}

          <div className="bg-[#EBEBFF] p-5 rounded-[2rem] flex flex-col justify-between h-40 relative group hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg mb-2">
              📅
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">{newTasks}</h3>
              <p className="text-slate-500 text-sm font-medium">New Tasks</p>
            </div>
          </div>

          {/* Card 2: All Tasks */}

          <div className="bg-[#EBF9FF] p-5 rounded-[2rem] flex flex-col justify-between h-40 relative group hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg mb-2">
              🎯
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">
                {totalTasks}
              </h3>
              <p className="text-slate-500 text-sm font-medium">Total Setup</p>
            </div>
          </div>

          {/* Card 3: Pending */}

          <div className="bg-[#FFF4E8] p-5 rounded-[2rem] flex flex-col justify-between h-40 relative group hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg mb-2">
              ⏳
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">
                {pendingTasks}
              </h3>
              <p className="text-slate-500 text-sm font-medium">On Hold</p>
            </div>
          </div>

          {/* Card 4: Completed */}

          <div className="bg-[#e4ffe9] p-5 rounded-[2rem] flex flex-col justify-between h-40 relative group hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg mb-2">
              ✅
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">
                {completedTasks}
              </h3>
              <p className="text-slate-500 text-sm font-medium">Completed</p>
            </div>
          </div>
        </div>

        {/* =============================================
            4. Filter Tabs (Pill Shape)
            ============================================= */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filter === "all"
                ? "bg-[#1C1D22] text-white shadow-lg"
                : "bg-white text-slate-500"
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filter === "pending"
                ? "bg-[#1C1D22] text-white shadow-lg"
                : "bg-white text-slate-500"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filter === "completed"
                ? "bg-[#1C1D22] text-white shadow-lg"
                : "bg-white text-slate-500"
            }`}
          >
            Completed
          </button>
        </div>

        {/* =============================================
            5. Task List (New Card Style)
            ============================================= */}
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-xl font-bold text-slate-800">Your Tasks</h3>
            <span className="text-slate-400 text-xs">
              Today, {new Date().getDate()}{" "}
              {new Date().toLocaleString("en-US", { month: "short" })}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-8 text-center text-slate-400 shadow-sm">
              No tasks found.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const imgSrc = resolveImageSrc(task.image_url);
              return (
                <div
                  key={task.id}
                  className="bg-white p-5 rounded-[2rem] shadow-sm flex flex-col gap-3 relative overflow-hidden group"
                >
                  {/* Decorative Header (Time) */}
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                      {formatDateTime(task.created_at)}
                    </span>
                    {/* Actions Menu (Small) */}
                    <div className="flex gap-2">
                      <Link
                        href={`/updatetask/${task.id}`}
                        className="text-slate-300 hover:text-blue-500"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-slate-300 hover:text-red-500"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <h4
                        className={`text-lg font-bold mb-1 ${
                          task.is_completed
                            ? "text-slate-400 line-through"
                            : "text-slate-800"
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {task.detail}
                      </p>
                    </div>

                    {/* Image Preview (Circle Avatar style) or Arrow */}
                    {imgSrc ? (
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                        <Image
                          src={imgSrc}
                          width={48}
                          height={48}
                          alt="task"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#1C1D22] flex items-center justify-center text-white text-lg rotate-[-45deg] shadow-lg shadow-indigo-200">
                        ➜
                      </div>
                    )}
                  </div>

                  {/* Tags / Status */}
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`px-4 py-2 rounded-full text-xs font-bold ${
                        task.is_completed
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-700 text-white"
                      }`}
                    >
                      {task.is_completed ? "Done" : "Pending"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =============================================
          6. Bottom Navigation Bar (Floating Dock)
          ============================================= */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 px-6 py-4 flex justify-center items-center z-50 text-slate-400 pb-8 md:pb-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        {/* Home */}
        {/* <button className="flex flex-col items-center gap-1 text-[#1C1D22]">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
            <span className="text-[10px] font-medium">Home</span>
         </button> */}

        {/* Tasks (Link to list or fake) */}
        {/* <button className="flex flex-col items-center gap-1 hover:text-[#1C1D22]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="text-[10px] font-medium">Tasks</span>
         </button> */}

        {/* ADD BUTTON (Floating Center) */}
        <Link
          href="/addtask"
          className="w-14 h-14 bg-[#4B4CED] rounded-full flex-col flex items-center justify-center text-white shadow-xl shadow-indigo-300 -mt-8 hover:scale-105 transition-transform border-4 border-[#F5F5FA]"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </Link>

        {/* Progress */}
        {/* <button className="flex flex-col items-center gap-1 hover:text-[#1C1D22]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <span className="text-[10px] font-medium">Progress</span>
         </button> */}

        {/* Profile */}
        {/* <button className="flex flex-col items-center gap-1 hover:text-[#1C1D22]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-[10px] font-medium">Profile</span>
         </button>
      </div>  */}
      </div>
    </div>
  );
}
