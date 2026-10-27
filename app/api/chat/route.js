import { NextResponse } from "next/server";
import { saveChatInteraction } from "@/lib/chat-data";

export async function POST(request) {
  try {
    const body = await request.json();

    // 1. Ambil teks pertanyaan dari 'question' atau 'message'
    const questionText = (body.question || body.message || "").trim();
    const sessionId = body.sessionId;
    const consent = body.consent;
    const consentNoticeVersion = body.consentNoticeVersion || "v1";

    // Validasi pertanyaan
    if (!questionText || questionText.length > 4000) {
      return NextResponse.json(
        { error: "Pertanyaan tidak valid atau terlalu panjang." },
        { status: 400 }
      );
    }

    // Validasi consent (harus true)
    if (consent !== true) {
      return NextResponse.json(
        { error: "Persetujuan pemrosesan data diperlukan." },
        { status: 400 }
      );
    }

    // Validasi sessionId (harus format UUID yang valid)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!sessionId || !uuidPattern.test(sessionId)) {
      return NextResponse.json(
        { error: "ID sesi tidak valid." },
        { status: 400 }
      );
    }
    
    // 2. Teruskan ke FastAPI (kirim kedua field agar kompatibel)
    const baseUrl = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";
    const upstream = await fetch(`${baseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: questionText, question: questionText }),
      cache: "no-store",
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    
    // 3. Simpan interaksi ke Supabase (opsional/non-blocking)
    try {
      if (sessionId && consent) {
        await saveChatInteraction({
          sessionId,
          question: questionText,
          answer: data.answer,
          sources: Array.isArray(data.sources) ? data.sources : [],
          consentNoticeVersion,
        });
      }
    } catch (saveErr) {
      console.error("Gagal simpan ke Supabase (diabaikan):", saveErr.message);
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("Chat API error detail:", error);
    return NextResponse.json(
      { error: "Layanan chatbot belum dapat dihubungi." },
      { status: 500 }
    );
  }
}