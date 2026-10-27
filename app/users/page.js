"use client";
import { useEffect, useState } from "react";
import UserCard from "@/components/UserCard";

export default function UsersPage() {
  // 1. Deklarasi state untuk menyimpan data pengguna
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  //Buat Hasil Filter
const filteredUsers = users.filter((user) =>
  user.name.toLowerCase().includes(search.toLowerCase())
);

  // 2. Logika Fetch Data (Logika untuk mengambil data pengguna dari API)
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gagal mengambil data");
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // 3. Penanganan Kondisi UI (Loading, Error, dan Data)
  if (loading) {
    return (
      <section className="relative min-h-screen">
        <div className="bg-grid bg-radial-fade absolute inset-0 -z-10" />
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative min-h-screen">
        <div className="bg-grid bg-radial-fade absolute inset-0 -z-10" />
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="font-semibold text-red-700">Something went wrong</h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // 4. Return Utama (Data Berhasil Dirender)
  return (
    <section className="relative min-h-screen">
      <div className="bg-grid bg-radial-fade absolute inset-0 -z-10" />

      <div className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="mb-6 text-3xl font-bold">User Directory</h1>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 w-full rounded-lg border bg-black px-4 py-2"
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))
          ) : (
            <p className="text-muted-foreground">User tidak ditemukan.</p>
          )}
        </div>
      </div>
    </section>
  );
}
