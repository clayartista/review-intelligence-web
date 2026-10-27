"use client";

import { useState } from "react";

const INTERESTS = [
  ["Teknologi dan AI", "technology"],
  ["Data dan analisis", "data"],
  ["Komunitas dan kegiatan sosial", "community"],
  ["Pemberdayaan perempuan", "women_empowerment"],
  ["Lingkungan dan keberlanjutan", "environment"],
  ["Pendidikan dan belajar", "learning"],
  ["Komunikasi dan kepemimpinan", "communication"],
  ["Desain dan kreativitas", "design"],
  ["Karier dan pengembangan diri", "career"],
  ["Menulis dan membaca", "writing"],
];

const SKILLS = [
  ["Literasi digital", "digital_literacy"],
  ["Python dasar", "python_basic"],
  ["Analisis data", "data_analysis"],
  ["Spreadsheet / Excel", "spreadsheet"],
  ["Komunikasi", "communication"],
  ["Kerja sama tim", "teamwork"],
  ["Menulis", "writing"],
  ["Desain", "design"],
  ["Presentasi", "presentation"],
  ["Mengajar", "teaching"],
  ["Organisasi kegiatan", "organization"],
  ["Membaca", "reading"],
  ["Berpikir kritis", "critical_thinking"],
  ["Pemecahan masalah", "problem_solving"],
  ["Saya masih pemula / belum yakin", "beginner"],
];

const HABITS = [
  ["Belajar mandiri", "self_learning"],
  ["Membaca", "reading"],
  ["Konsisten menjalankan rutinitas", "consistency"],
  ["Bekerja dengan orang lain", "teamwork"],
  ["Menjadi relawan", "volunteering"],
  ["Aktivitas luar ruangan", "outdoor_activity"],
  ["Mencoba dan membuat proyek", "problem_solving"],
];

function MultiSelect({ title, options, value, onChange }) {
  function toggle(feature) {
    onChange(
      value.includes(feature)
        ? value.filter((item) => item !== feature)
        : [...value, feature]
    );
  }

  return (
    <fieldset className="mb-6 rounded-xl border border-border p-4 bg-card text-card-foreground">
      <legend className="px-2 font-semibold text-sm">{title}</legend>
      <div className="grid gap-2 sm:grid-cols-2 mt-2">
        {options.map(([label, feature]) => (
          <label key={feature} className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80">
            <input
              type="checkbox"
              className="rounded border-gray-400"
              checked={value.includes(feature)}
              onChange={() => toggle(feature)}
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function RecommendationsPage() {
  const [interests, setInterests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [habits, setHabits] = useState([]);
  const [availableMinutes, setAvailableMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState("any");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitForm(event) {
    event.preventDefault();
    setError("");
    setResults([]);
    setLoading(true);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests,
          skills,
          habits,
          available_minutes: Number(availableMinutes),
          preferred_difficulty: difficulty,
          top_n: 5,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.detail || "Gagal mendapatkan rekomendasi.");
      }

      setResults(data.recommendations || []);
      if (!data.recommendations?.length) {
        setError("Belum ada rekomendasi yang cocok. Coba variasikan pilihan Anda.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-foreground">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Rekomendasi Aktivitas</h1>
      <p className="mb-8 text-muted-foreground text-sm leading-relaxed">
        Pilih minat, keahlian, kebiasaan, dan waktu luang Anda untuk menemukan aktivitas yang paling relevan.
      </p>

      <form onSubmit={submitForm}>
        <MultiSelect title="1. Apa minatmu?" options={INTERESTS} value={interests} onChange={setInterests} />
        <MultiSelect title="2. Skill apa yang kamu miliki?" options={SKILLS} value={skills} onChange={setSkills} />
        <MultiSelect title="3. Kebiasaan / Pola aktivitas" options={HABITS} value={habits} onChange={setHabits} />

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Waktu yang tersedia</span>
            <select
              className="rounded-lg border border-border bg-background p-3 text-sm"
              value={availableMinutes}
              onChange={(e) => setAvailableMinutes(e.target.value)}
            >
              <option value={15}>15 menit</option>
              <option value={30}>30 menit</option>
              <option value={45}>45 menit</option>
              <option value={60}>60 menit</option>
              <option value={90}>90 menit atau lebih</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Tingkat kesulitan</span>
            <select
              className="rounded-lg border border-border bg-background p-3 text-sm"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="beginner">Pemula</option>
              <option value="intermediate">Menengah</option>
              <option value="any">Semua tingkat</option>
            </select>
          </label>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Menghitung rekomendasi..." : "Dapatkan Rekomendasi"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Hasil Rekomendasi</h2>
          <div className="grid gap-4">
            {results.map((item) => (
              <article key={item.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{item.rank}. {item.title}</h3>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                    Skor: {item.score} / 100
                  </span>
                </div>
                <p className="my-2 text-sm text-muted-foreground">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  Durasi: {item.duration_minutes} menit · Tingkat: {item.difficulty}
                </p>
                {item.reason && (
                  <p className="mt-3 rounded-lg bg-muted/50 p-3 text-xs leading-5">
                    💡 <strong>Alasan:</strong> {item.reason}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}