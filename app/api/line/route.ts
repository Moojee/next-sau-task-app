import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("🔥 LINE API HIT");

  try {
    const body = await req.json();
    console.log("📦 Body received:", body);

    // ตรวจสอบว่ามี environment variables หรือไม่
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      console.error("❌ LINE_CHANNEL_ACCESS_TOKEN not found");
      return NextResponse.json(
        { error: "LINE_CHANNEL_ACCESS_TOKEN not configured" },
        { status: 500 }
      );
    }

    if (!process.env.LINE_USER_ID) {
      console.error("❌ LINE_USER_ID not found");
      return NextResponse.json(
        { error: "LINE_USER_ID not configured" },
        { status: 500 }
      );
    }

    // สร้างข้อความที่จะส่ง
    const statusText = body.isCompleted ? "✅ เสร็จแล้ว" : "⏳ กำลังทำ";
    let messageText = `📌 งานใหม่!\n\n${body.title}\n\n${body.detail}\n\nสถานะ: ${statusText}`;

    // สร้าง messages array
    const messages: any[] = [
      {
        type: "text",
        text: messageText,
      },
    ];

    // ถ้ามีรูป ให้ส่งรูปด้วย
    if (body.imageUrl) {
      messages.push({
        type: "image",
        originalContentUrl: body.imageUrl,
        previewImageUrl: body.imageUrl,
      });
    }

    // ส่งข้อความผ่าน LINE Messaging API
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: process.env.LINE_USER_ID,
        messages: messages,
      }),
    });

    console.log("📡 LINE Response Status:", res.status);

    // อ่าน response
    const responseText = await res.text();
    console.log("📨 LINE Response:", responseText);

    if (!res.ok) {
      console.error("❌ LINE API Error:", responseText);
      return NextResponse.json(
        { error: "LINE API failed", details: responseText },
        { status: res.status }
      );
    }

    console.log("✅ LINE notification sent successfully");
    return NextResponse.json({ success: true, data: responseText });

  } catch (err) {
    console.error("💥 API ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}