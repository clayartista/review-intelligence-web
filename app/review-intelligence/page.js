"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const SENTIMENT_COLORS = {
  positive: "#16a34a",
  neutral: "#64748b",
  negative: "#dc2626"
};

export default function ReviewIntelligencePage() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      try {
        const response = await fetch("/api/review-intelligence");
        if (!response.ok) throw new Error("API gagal memuat data review.");
        const json = await response.json();
        if (active) setPayload(json);
      } catch (err) {
        if (active) setError(err.message || "Terjadi kesalahan.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReviews();
    return () => { active = false; };
  }, []);

  const reviews = payload?.reviews ?? [];
  const sentimentData = useMemo(() => {
    const counts = payload?.sentimentCounts ?? {};
    return ["positive", "neutral", "negative"].map((key) => ({
      name: key,
      value: counts[key] ?? 0,
      fill: SENTIMENT_COLORS[key]
    }));
  }, [payload]);

  const ratingData = useMemo(() => {
    const counts = new Map();
    for (const review of reviews) {
      const rating = Number(review.stars);
      if (Number.isFinite(rating)) {
        const key = `${rating} bintang`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([rating, count]) => ({ rating, count }))
      .sort((a, b) => Number.parseFloat(a.rating) - Number.parseFloat(b.rating));
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((review) => {
      const text = String(review.review_text ?? "").toLowerCase();
      const restaurant = String(review.restaurant_name ?? "").toLowerCase();
      const matchesSearch = !q || text.includes(q) || restaurant.includes(q);
      const label = String(review.sentiment_label ?? "").toLowerCase();
      const matchesSentiment =
        sentimentFilter === "all" || label === sentimentFilter;
      return matchesSearch && matchesSentiment;
    });
  }, [reviews, search, sentimentFilter]);

  if (loading) return <main className="p-8">Memuat dashboard...</main>;
  if (error) return <main className="p-8 text-red-700">Error: {error}</main>;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <p className="text-sm text-slate-500">CUSTOMER REVIEW ANALYTICS</p>
        <h1 className="text-3xl font-bold">Review Intelligence</h1>
        <p className="mt-2 text-slate-600">
          Ringkasan ulasan pelanggan untuk membantu evaluasi pengalaman pelanggan.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi title="Total review (API)" value={payload?.totalReviews ?? 0} />
        <Kpi
          title="Rating rata-rata"
          value={payload?.averageRating == null
            ? "—"
            : payload.averageRating.toFixed(2)}
        />
        <Kpi
          title="Sentimen negatif"
          value={payload?.sentimentCounts?.negative ?? 0}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h2 className="mb-4 text-lg font-semibold">Distribusi sentimen</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sentimentData} dataKey="value" nameKey="name"
                  outerRadius={90} label>
                  {sentimentData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <h2 className="mb-4 text-lg font-semibold">Distribusi rating</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" name="Jumlah review" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Jelajahi ulasan</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className="w-full rounded-lg border p-2"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari kata dalam ulasan..."
          />
          <select
            className="w-full rounded-lg border p-2"
            value={sentimentFilter}
            onChange={(event) => setSentimentFilter(event.target.value)}
          >
            <option value="all">Semua sentimen</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>

        <p className="my-3 text-sm text-slate-500">
          Menampilkan {filteredReviews.length} dari {reviews.length} review yang dimuat API.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-175 border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">Tanggal</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Sentimen</th>
                <th className="p-3">Ulasan</th>
                <th className="p-3">Sumber</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review.review_id} className="border-b align-top">
                  <td className="p-3 whitespace-nowrap">
                    {review.published_at
                      ? new Date(review.published_at).toLocaleDateString("id-ID")
                      : "—"}
                  </td>
                  <td className="p-3">{review.stars ?? "—"}</td>
                  <td className="p-3">
                    {review.sentiment_label ?? "Belum dianalisis"}
                  </td>
                  <td className="p-3 min-w-70">
                    {review.review_text || "(Tidak ada teks ulasan)"}
                  </td>
                  <td className="p-3">
                    {review.review_url ? (
                      <a className="text-blue-700 underline"
                        href={review.review_url} target="_blank"
                        rel="noreferrer">Buka</a>
                    ) : "—"}
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr><td className="p-3" colSpan={5}>Tidak ada review yang cocok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="rounded-xl border p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
