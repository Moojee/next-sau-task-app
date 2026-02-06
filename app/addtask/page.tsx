"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AddTaskPage() {
  // ===============================
  // State
  // ===============================
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===============================
  // Image Select
  // ===============================
  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("ไฟล์รูปต้องไม่เกิน 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  // ===============================
  // Submit Form
  // ===============================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !detail.trim()) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = "";

      // 1. Upload Image
      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("task_bk")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("task_bk")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      // 2. Insert Task
      const { error } = await supabase.from("task_tb").insert({
        title: title.trim(),
        detail: detail.trim(),
        image_url: imageUrl,
        is_completed: isCompleted,
      });

      if (error) throw error;

      // 3. ส่ง LINE Notification
      try {
        const lineResponse = await fetch("/api/line", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            detail: detail.trim(),
            imageUrl: imageUrl,
            isCompleted: isCompleted,
          }),
        });

        if (!lineResponse.ok) {
          console.error("LINE notification failed");
        }
      } catch (lineErr) {
        console.error("LINE API Error:", lineErr);
        // ไม่ให้ LINE error ทำให้การสร้าง task ล้มเหลว
      }

      // 4. Success → ไปหน้า list
      window.location.replace("/alltask");

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5FA] pb-10">
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur px-6 py-4 flex items-center gap-4">
        <Link
          href="/alltask"
          className="w-10 h-10 rounded-full border flex items-center justify-center"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold">New Ticket to Moojeefilm</h1>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto px-6 mt-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[2rem] p-6 space-y-6 shadow-sm"
        >
          {/* Title */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-500">
              Task Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 rounded-2xl bg-[#F5F5FA]"
              placeholder="What needs to be done?"
              required
            />
          </div>

          {/* Detail */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-500">
              Description
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-[#F5F5FA] h-32 resize-none"
              placeholder="Add details..."
              required
            />
          </div>

          {/* Image */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-500">
              Attachment
            </label>

            {!imagePreview ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  id="file"
                  className="hidden"
                  onChange={handleSelectImage}
                />
                <label
                  htmlFor="file"
                  className="block text-center p-8 border-2 border-dashed rounded-2xl cursor-pointer bg-[#F5F5FA]"
                >
                  📷 Upload image
                </label>
              </>
            ) : (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="preview"
                  width={400}
                  height={300}
                  className="rounded-2xl object-cover h-48 w-full"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-white rounded-full px-3 py-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Status
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-500">
              Status
            </label>
            <select
              value={isCompleted ? "1" : "0"}
              onChange={(e) => setIsCompleted(e.target.value === "1")}
              className="w-full p-4 rounded-2xl bg-[#F5F5FA]"
            >
              <option value="0">⏳ In Progress</option>
              <option value="1">✅ Completed</option>
            </select>
          </div> */}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Link
              href="/alltask"
              className="flex-1 text-center py-4 rounded-2xl border"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white font-bold disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}