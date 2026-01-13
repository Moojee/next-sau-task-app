"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";

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
  // Router & Params
  // =============================================
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const taskId = params?.id;

  // =============================================
  // State Management
  // =============================================
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =============================================
  // Fetch Task Data
  // =============================================
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
        // alert("Task not found"); // ตัด alert ออกเพื่อ UX ที่ดี
        router.push("/alltask");
        return;
      }

      const t = data as Task;
      setTitle(t.title ?? "");
      setDetail(t.detail ?? "");
      setIsCompleted(!!t.is_completed);
      
      const url = (t.image_url ?? "").trim();
      setCurrentImageUrl(url);
      setImagePreview(url);
      
      setLoading(false);
    };

    fetchTask();
  }, [taskId, router]);

  // =============================================
  // Handlers
  // =============================================
  const handleSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setCurrentImageUrl("");
  };

  const handleUploadAndUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (title.trim() === "" || detail.trim() === "") {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = currentImageUrl;

      // Upload New Image (if selected)
      if (imageFile) {
        const newFileName = `${Date.now()}_${imageFile.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("task_bk")
          .upload(newFileName, imageFile);

        if (uploadErr) {
          alert("Upload failed");
          setIsSubmitting(false);
          return;
        }

        const { data: pub } = supabase.storage
          .from("task_bk")
          .getPublicUrl(newFileName);

        imageUrl = pub.publicUrl;
      }

      // Update Database
      const { error: upErr } = await supabase
        .from("task_tb")
        .update({
          title: title.trim(),
          detail: detail.trim(),
          image_url: imageUrl,
          is_completed: isCompleted,
          update_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (upErr) {
        alert("Update failed");
        setIsSubmitting(false);
        return;
      }

      router.push("/alltask");
    } catch (error) {
      console.error("Error:", error);
      alert("Unexpected error");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#4B4CED] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Loading task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5FA] font-sans pb-10">
      
      {/* =============================================
          1. Mobile Header (Back Button & Title)
          ============================================= */}
      <div className="px-6 pt-8 pb-4 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <Link 
          href="/alltask"
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Edit Task</h1>
      </div>

      <div className="max-w-xl mx-auto px-6 mt-4">
        
        {/* =============================================
            2. Form Card
            ============================================= */}
        <div className="bg-white rounded-[2rem] shadow-sm p-6 md:p-8">
          <form onSubmit={handleUploadAndUpdate} className="space-y-6">
            
            {/* Title Input */}
            <div>
              <label className="block text-slate-500 font-semibold mb-2 text-sm ml-2">
                Task Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                className="w-full bg-[#F5F5FA] border-none rounded-2xl p-4 text-slate-800 font-medium placeholder-slate-400 focus:ring-2 focus:ring-[#4B4CED] transition-all"
                placeholder="Task title..."
                required
              />
            </div>

            {/* Detail Textarea */}
            <div>
              <label className="block text-slate-500 font-semibold mb-2 text-sm ml-2">
                Description
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                className="w-full bg-[#F5F5FA] border-none rounded-2xl p-4 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#4B4CED] transition-all resize-none h-32"
                placeholder="Details..."
                required
              />
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="block text-slate-500 font-semibold mb-2 text-sm ml-2">
                Attachment
              </label>
              
              {!imagePreview ? (
                // No Image: Show Upload Box
                <div>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSelectImage}
                  />
                  <label
                    htmlFor="fileInput"
                    className="flex flex-col items-center justify-center gap-2 bg-[#F5F5FA] hover:bg-slate-100 
                               border-2 border-dashed border-slate-300 hover:border-[#4B4CED]
                               text-slate-500 py-8 rounded-2xl cursor-pointer 
                               transition-all duration-300 w-full group"
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl group-hover:scale-110 transition-transform">
                      📷
                    </div>
                    <span className="text-sm font-medium">Tap to upload image</span>
                  </label>
                </div>
              ) : (
                // Has Image: Show Preview with Remove Button
                <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                        <Image
                            src={imagePreview}
                            alt="preview"
                            width={400}
                            height={300}
                            className="w-full h-48 object-cover"
                        />
                        {/* Remove Button */}
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur text-red-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* Change Image Button */}
                    <div className="text-center">
                        <input
                            id="changeFileInput"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleSelectImage}
                        />
                        <label
                            htmlFor="changeFileInput"
                            className="inline-block text-[#4B4CED] text-sm font-semibold cursor-pointer hover:underline"
                        >
                            Change Image
                        </label>
                    </div>
                </div>
              )}
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-slate-500 font-semibold mb-2 text-sm ml-2">
                Status
              </label>
              <div className="relative">
                <select
                  value={isCompleted ? "1" : "0"}
                  onChange={(e) => setIsCompleted(e.target.value === "1")}
                  className="w-full bg-[#F5F5FA] border-none rounded-2xl p-4 appearance-none text-slate-800 font-medium focus:ring-2 focus:ring-[#4B4CED] transition-all"
                >
                  <option value="0">⏳ In Progress</option>
                  <option value="1">✅ Completed</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex gap-3">
              <Link
                href="/alltask"
                className="flex-1 py-4 rounded-2xl font-bold text-center text-slate-500 bg-transparent border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-4 rounded-2xl font-bold text-white bg-[#4B4CED] hover:bg-[#3f40d6] shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}