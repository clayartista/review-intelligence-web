"use client";
import { useEffect, useState } from "react";
import { useFavorite } from "@/context/FavoriteContext";
import UserCard from "@/components/UserCard";

export default function FavoritesPage() {
  const { favorites, loading: favoritesLoading, error: favoritesError } = useFavorite();
  const [favoriteUsers, setFavoriteUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    if (favoritesLoading || favoritesError || favorites.length === 0) {
      return;
    }

    let cancelled = false;

    async function loadFavoriteUsers() {
      setUsersLoading(true);
      setUsersError("");

      try {
        const users = await Promise.all(
          favorites.map(async (favorite) => {
            const userId = favorite.user_id ?? favorite.app_users?.id;
            if (!userId) {
              throw new Error("Data favorit tidak memiliki ID pengguna.");
            }

            const response = await fetch(
              `https://jsonplaceholder.typicode.com/users/${userId}`
            );
            if (!response.ok) {
              throw new Error(`Gagal mengambil data pengguna ${userId}.`);
            }

            return response.json();
          })
        );

        if (!cancelled) {
          setFavoriteUsers(users);
        }
      } catch (error) {
        if (!cancelled) {
          setUsersError(
            error instanceof Error ? error.message : "Gagal mengambil data pengguna favorit."
          );
        }
      } finally {
        if (!cancelled) {
          setUsersLoading(false);
        }
      }
    }

    loadFavoriteUsers();

    return () => {
      cancelled = true;
    };
  }, [favorites, favoritesError, favoritesLoading]);

  return (
    <section className="relative min-h-screen">
      <div className="bg-grid bg-radial-fade absolute inset-0 -z-10" />

      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-semibold text-primary">Favorite</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
          My Favorite Users
        </h1>
        <p className="mt-4 mb-8 text-muted-foreground">
          Data ini diambil langsung dari FavouriteContext.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favoritesLoading ? (
            <p className="text-muted-foreground">Loading favorite users...</p>
          ) : favoritesError || usersError ? (
            <p role="alert" className="text-destructive">
              {favoritesError || usersError}
            </p>
          ) : favorites.length === 0 ? (
            <p className="text-gray-500">Anda belum memiliki user favorit.</p>
          ) : usersLoading ? (
            <p className="text-muted-foreground">Loading favorite users...</p>
          ) : favoriteUsers.length > 0 ? (
            favoriteUsers.map((user) => <UserCard key={user.id} user={user} />)
          ) : (
            <p className="text-gray-500">Data pengguna favorit tidak tersedia.</p>
          )}
        </div>
      </div>
    </section>
  );
}