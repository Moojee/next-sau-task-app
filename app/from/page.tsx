"use client";

import { useState } from "react";

type FormState = {
  name: string;
  phone: string;
  note: string;
};

export default function FormPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    note: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const submitForm = async () => {
  try {
    const res = await fetch("http://localhost:4000/api/form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) throw new Error("submit failed");

    alert("ส่งข้อมูลเรียบร้อย 🎉");
  } catch (err) {
    console.error(err);
    alert("ส่งไม่สำเร็จ");
  }
};


  

  return (
    <div className="p-6 max-w-md mx-auto space-y-3">
      <h1 className="text-xl font-bold">ส่งงานให้ moojee</h1>

      <input
        name="name"
        placeholder="ชื่อผู้ส่งงาน"
        value={form.name}
        onChange={handleChange}
        className="border p-2 w-full rounded"
      />

      <input
        name="phone"
        placeholder="เบอร์ติดต่อ"
        value={form.phone}
        onChange={handleChange}
        className="border p-2 w-full rounded"
      />

      <textarea
        name="note"
        placeholder="รายละเอียดงาน"
        value={form.note}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        rows={4}
      />

      <button
        onClick={submitForm}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        ส่ง Task
      </button>
    </div>
  );
}
