"use client";

import { createContext, useContext, useEffect, useState } from "react";

const FavoriteContext = createContext(undefined);

export function FavoriteProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFavorites() {
      try {
        const response = await fetch("/api/favorites");
        if (!response.ok) {
          throw new Error("Gagal mengambil daftar favorit.");
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Format daftar favorit tidak valid.");
        }

        setFavorites(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Gagal mengambil daftar favorit.");
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  const addFavorite = async (user) => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (res.ok) {
      const saved = await res.json();
      const nextFavorite = saved?.data ?? saved;
      setFavorites((prev) => [...prev, nextFavorite]);
    }
  };

  const updateFavorite = async (id, note) => {
    const res = await fetch(`/api/favorites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });

    if (res.ok) {
      const data = await res.json();
      const updatedFavorite = data?.data ?? { note };

      setFavorites((prev) =>
        prev.map((fav) =>
          String(fav.id) === String(id) ? { ...fav, ...updatedFavorite } : fav
        )
      );
    }
  };

  const removeFavorite = async (userId) => {
    const res = await fetch(`/api/favorites/${userId}`, { method: "DELETE" });

    if (res.ok) {
      setFavorites((prev) =>
        prev.filter((f) => String(f.user_id) !== String(userId))
      );
    }
  };

  const isFavorite = (userId) => {
    return favorites.some((f) => String(f.user_id) === String(userId));
  };

  const value = {
    favorites,
    loading,
    error,
    addFavorite,
    updateFavorite,
    removeFavorite,
    isFavorite,
  };

  return (
    <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>
  );
}

export function useFavorite() {
  const context = useContext(FavoriteContext);

  if (context === undefined) {
    throw new Error("useFavorite harus dipakai di dalam <FavoriteProvider>");
  }

  return context;
}