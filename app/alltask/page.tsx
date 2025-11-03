"use client";

import Image from "next/image";
import task from "./../../assets/images/task.png";
import Link from "next/link";
import Footer from "@/components/footer";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// สร้างประเภทข้อมูล Task
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
  // สร้างตัวแปร state เก็บรายการงานทั้งหมด
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ดึงข้อมูลรายการทั้งหมดจาก supabase
    const fetchTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("task_tb")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        alert("เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง");
        console.log(error.message);
      } else if (data) {
        setTasks(data as Task[]);
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  // ✅ ฟังก์ชันตรวจสอบว่า image_url ใช้ได้จริงไหม
  const resolveImageSrc = (src?: string | null): string | null => {
    if (!src) return null;
    const s = src.trim();
    if (s.startsWith("/") || s.startsWith("http://") || s.startsWith("https://")) {
      return s;
    }
    return null;
  };

  // ✅ ฟังก์ชันลบงาน
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("ยืนยันการลบงานนี้หรือไม่?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("task_tb").delete().eq("id", id);

    if (error) {
      alert("ลบไม่สำเร็จ กรุณาลองใหม่");
      console.log(error.message);
      return;
    }

    // อัปเดต state ฝั่งหน้าเว็บทันที
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <Image className="mt-20" src={task} alt="Task" width={120} />

        <h1 className="mt-5 text-2xl font-bold text-gray-600">Manage Task App</h1>

        <h1 className="text-l text-gray-500">บริหารจัดการงานที่ทำ</h1>

        {/* ส่วนปุ่มเพิ่มงาน */}
        <div className="w-10/12 flex justify-end">
          <Link
            href="/addtask"
            className="bg-gray-500 hover:bg-gray-700 px-10 py-2 rounded-2xl mt-10 text-white"
          >
            เพิ่มงาน
          </Link>
        </div>

        {/* ส่วนแสดงตาราง */}
        <div className="w-10/12 flex mt-5">
          <table className="w-full">
            <thead>
              <tr className="text-center border font-bold bg-gray-400">
                <th className="border p-2">รูป</th>
                <th className="border p-2">งานที่ต้องทำ</th>
                <th className="border p-2">รายละเอียดงาน</th>
                <th className="border p-2">สถานะ</th>
                <th className="border p-2">วันที่เพิ่ม</th>
                <th className="border p-2">วันที่แก้ไข</th>
                <th className="border p-2">action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="border p-4 text-center" colSpan={7}>
                    กำลังโหลด...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td className="border p-4 text-center" colSpan={7}>
                    ไม่มีข้อมูลงาน
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const imgSrc = resolveImageSrc(task.image_url);

                  return (
                    <tr key={task.id}>
                      <td className="border p-2 text-center">
                        {imgSrc ? (
                          <Image
                            className="mx-auto"
                            src={imgSrc}
                            alt={task.title}
                            width={50}
                            height={50}
                          />
                        ) : (
                          "-" // ถ้าไม่ใช่ URL ให้แสดงขีด
                        )}
                      </td>
                      <td className="border p-2">{task.title}</td>
                      <td className="border p-2">{task.detail}</td>
                      <td className="border p-2">
                        {task.is_completed ? "✔︎ สำเร็จ" : "✕ ไม่สำเร็จ"}
                      </td>
                      <td className="border p-2">
                        {new Date(task.created_at).toLocaleString()}
                      </td>
                      <td className="border p-2">
                        {task.update_at ? new Date(task.update_at).toLocaleString() : "-"}
                      </td>
                      <td className="border p-2">
                        <Link
                          className="text-green-500 mr-5 hover:text-green-700"
                          href={`/updatetask/${task.id}`}
                        >
                          แก้ไข
                        </Link>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </>
  );
}
