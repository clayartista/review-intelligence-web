"use client";

import { useState, useEffect } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Halo, saya bisa membantu mencari informasi dari dokumen " +
        "yang tersedia. Apa yang ingin kamu tanyakan?",
    },
  ]);

  async function sendMessage(event) {
    event?.preventDefault();
    const message = input.trim();

    // Jangan kirim jika input kosong, belum dicentang, atau sessionId belum siap
    if (!message || loading || !consent || !sessionId) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: message,          // Pastikan mengirim nilai dari 'message'
          message: message,
          sessionId: sessionId,       // Pastikan UUID dari crypto.randomUUID()
          consent: consent,           // Pastikan bernilai true
          consentNoticeVersion: "v1",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.detail || "Permintaan gagal");
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "Belum ada jawaban." },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Maaf, terjadi kendala: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: 9999,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {open && (
        <section
          style={{
            width: 360,
            height: 540,
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "calc(100vh - 100px)",
            background: "#111827",
            color: "#F9FAFB",
            borderRadius: 16,
            boxShadow: "0 12px 40px #0004",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          {/* Header */}
          <header
            style={{
              padding: 16,
              background: "#1F2937",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #374151",
            }}
          >
            <div>
              <strong>Virtual Safe Space</strong>
              <div style={{ fontSize: 12, color: "#D1D5DB", marginTop: 4 }}>
                Informasi awal berbasis dokumen
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Tutup chat"
              style={{
                background: "transparent",
                color: "white",
                border: 0,
                fontSize: 22,
                cursor: "pointer",
                padding: 4,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </header>

          {/* Chat Messages */}
          <div
            style={{
              padding: 12,
              flex: 1,
              overflowY: "auto",
            }}
            aria-live="polite"
          >
            {messages.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    item.role === "user" ? "flex-end" : "flex-start",
                  margin: "8px 0",
                }}
              >
                <div
                  style={{
                    maxWidth: "88%",
                    whiteSpace: "pre-wrap",
                    padding: "10px 12px",
                    borderRadius: 12,
                    lineHeight: 1.45,
                    fontSize: 14,
                    background: item.role === "user" ? "#0F766E" : "#374151",
                  }}
                >
                  {item.content}
                </div>
              </div>
            ))}
            {loading && (
              <p style={{ color: "#D1D5DB", fontSize: 13, margin: "8px 0" }}>
                Sedang mencari informasi…
              </p>
            )}
          </div>

          {/* Area Bawah: Consent Box & Input Form */}
          <div
            style={{
              borderTop: "1px solid #374151",
              background: "#111827",
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {/* Kotak Persetujuan / Consent Notice */}
            <div
              style={{
                background: "#1F2937",
                border: "1px solid #374151",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 11,
                color: "#D1D5DB",
                lineHeight: 1.4,
              }}
            >
              <p style={{ margin: 0 }}>
                Dengan mencentang kotak ini, Anda menyetujui pemrosesan percakapan
                untuk evaluasi kualitas chatbot. Hindari memasukkan nama, alamat,
                atau identitas pribadi.
              </p>
              <label
                style={{
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  color: "#F9FAFB",
                  fontWeight: 500,
                }}
              >
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <span>Saya menyetujui pemberitahuan di atas.</span>
              </label>
            </div>

            {/* Input Form Baris Horizontal */}
            <form
              onSubmit={sendMessage}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  !consent
                    ? "Centang persetujuan di atas untuk mulai…"
                    : "Tulis pertanyaan…"
                }
                aria-label="Tulis pertanyaan"
                disabled={!consent || loading}
                style={{
                  minWidth: 0,
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #4B5563",
                  background: "#1F2937",
                  color: "white",
                  fontSize: 13,
                  outline: "none",
                  opacity: !consent ? 0.6 : 1,
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim() || !consent || !sessionId}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: 0,
                  background: "#0F766E",
                  color: "white",
                  cursor:
                    loading || !input.trim() || !consent || !sessionId
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    loading || !input.trim() || !consent || !sessionId
                      ? 0.5
                      : 1,
                  fontWeight: 600,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                }}
              >
                Kirim
              </button>
            </form>

            <p
              style={{
                fontSize: 10,
                color: "#9CA3AF",
                margin: 0,
                textAlign: "center",
              }}
            >
              Bukan layanan darurat atau pengganti pendamping profesional.
            </p>
          </div>
        </section>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Tutup chatbot" : "Buka chatbot"}
        style={{
          float: "right",
          border: 0,
          borderRadius: 999,
          width: 58,
          height: 58,
          background: "#0F766E",
          color: "white",
          fontSize: 24,
          boxShadow: "0 4px 18px #0003",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {open ? "×" : "☏"}
      </button>
    </div>
  );
}