export const runtime = "nodejs";

export async function POST(request) {
  const apiBase = process.env.RECOMMENDATION_API_URL || "http://127.0.0.1:8002";

  try {
    const body = await request.json();

    const upstream = await fetch(`${apiBase.replace(/\/$/, "")}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const raw = await upstream.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { error: raw || "Respons backend bukan JSON." };
    }

    if (!upstream.ok) {
      return Response.json(
        { error: data.detail || data.error || "Rekomendasi gagal diproses." },
        { status: upstream.status }
      );
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error("Recommendation proxy error:", error);
    return Response.json(
      { error: "Backend Recommendation System (port 8002) tidak dapat dihubungi." },
      { status: 502 }
    );
  }
}
