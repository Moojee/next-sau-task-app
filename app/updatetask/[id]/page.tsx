"use client";

import Image from "next/image";
import task from "./../../../assets/images/task.png";
import Link from "next/link";
import Footer from "@/components/footer";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";

// ประเภทข้อมูล Task
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
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const taskId = params?.id;

  // สถานะฟอร์ม
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  // จัดการรูป
  const [imageFile, setImageFile] = useState<File | null>(null); // รูปใหม่ที่ผู้ใช้เลือก
  const [imagePreview, setImagePreview] = useState<string>("");  // พรีวิว (ใหม่หรือเดิม)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(""); // เก็บ URL เดิมจาก DB

  const [loading, setLoading] = useState(true);

  // โหลดงานเดิมจาก id
  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("task_tb")
        .select("*")
        .eq("id", taskId)
        .single();

      if (error) {
        alert("ไม่พบข้อมูลงาน หรือเกิดข้อผิดพลาด");
        console.log(error.message);
        router.push("/alltask");
        return;
      }

      const t = data as Task;
      setTitle(t.title ?? "");
      setDetail(t.detail ?? "");
      setIsCompleted(!!t.is_completed);
      const url = (t.image_url ?? "").trim();
      setCurrentImageUrl(url);
      setImagePreview(url); // ตั้งพรีวิวเป็นรูปเดิมก่อน
      setLoading(false);
    };

    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  // เลือกรูปใหม่
  const handleSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // อัปเดตข้อมูล (พร้อมอัปโหลดรูปถ้ามีเลือกใหม่)
  const handleUploadAndUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (title.trim() === "" || detail.trim() === "") {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (!taskId) {
      alert("ไม่พบรหัสงาน");
      return;
    }

    let imageUrl = currentImageUrl; // ค่าเริ่มต้นใช้รูปเดิม

    // ถ้าเลือกไฟล์ใหม่ → อัปโหลดขึ้น Storage แล้วเอา publicUrl มาใช้แทน
    if (imageFile) {
      const newFileName = `${Date.now()}_${imageFile.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("task_bk")
        .upload(newFileName, imageFile);

      if (uploadErr) {
        alert("เกิดข้อผิดพลาดในการอัปโหลดรูป กรุณาลองใหม่อีกครั้ง");
        console.log(uploadErr.message);
        return;
      }

      const { data: pub } = supabase.storage
        .from("task_bk")
        .getPublicUrl(newFileName);

      imageUrl = pub.publicUrl;
    }

    // อัปเดตลงตาราง
    const { error: upErr } = await supabase
      .from("task_tb")
      .update({
        title,
        detail,
        image_url: imageUrl,
        is_completed: isCompleted,
        update_at: new Date().toISOString(), // บันทึกเวลาที่แก้ไข
      })
      .eq("id", taskId);

    if (upErr) {
      alert("อัปเดตไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      console.log(upErr.message);
      return;
    }

    alert("อัปเดตข้อมูลงานเรียบร้อยแล้ว");
    router.push("/alltask");
  };

  return (
    <>
      <div className="flex flex-col items-center pb-30">
        {/* ส่วนบน */}
        <Image className="mt-20" src={task} alt="Task" width={120} />

        <h1 className="mt-8 text-2xl font-bold text-blue-700">Manage Task App</h1>
        <h1 className="mt-2 text-lg text-blue-700">บริการจัดการงานที่ทำ</h1>

        {/* กล่องฟอร์มอัปเดต */}
        <div className="w-3xl border border-gray-500 p-10 mx-auto rounded-xl mt-5">
          <h1 className="text-xl font-bold text-center">✏️ อัปเดตงาน</h1>

          {loading ? (
            <div className="text-center py-6">กำลังโหลด...</div>
          ) : (
            <form onSubmit={handleUploadAndUpdate} className="w-full space-y-4">
              <div>
                <label>ชื่องาน</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label>รายละเอียด</label>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  rows={5}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">อัปโหลดรูป (ถ้าไม่เลือกจะใช้รูปเดิม)</label>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelectImage}
                />
                <label
                  htmlFor="fileInput"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
                >
                  เลือกรูป
                </label>

                {/* แสดงรูปพรีวิว (รูปเดิมหรือรูปใหม่) */}
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="preview"
                    width={150}
                    height={150}
                    className="mt-2"
                  />
                ) : (
                  <div className="mt-2 text-gray-500">ไม่มีรูปภาพ</div>
                )}
              </div>

              <div>
                <label>สถานะ</label>
                <select
                  value={isCompleted ? "1" : "0"}
                  onChange={(e) => setIsCompleted(e.target.value === "1")}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="0">❌ ยังไม่เสร็จ</option>
                  <option value="1">✅ เสร็จแล้ว</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </form>
          )}

          <Link
            href="/alltask"
            className="text-blue-500 w-full text-center mt-5 block hover:text-blue-600"
          >
            กลับไปหน้าแสดงงานทั้งหมด
          </Link>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
