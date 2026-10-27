"use client";

import { Heart } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useFavorite } from "@/context/FavoriteContext";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UserCard({ user }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorite();
  const favorited = isFavorite(user.id);

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="group border border-white/10 bg-foreground/3 transition-all hover:-translate-y-1 hover:border-foreground/20 hover:shadow-xl hover:shadow-black/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/40 to-primary/10 text-sm font-semibold">
            {initials}
          </div>
          <CardTitle>{user.name}</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">{user.email}</p>

        <p className="mt-1 text-sm text-muted-foreground">
            {user?.company?.name || "Tidak ada perusahaan"}
        </p>

        <div className="mt-4 flex gap-2">
          <a
            href={`https://jsonplaceholder.typicode.com/users/${user.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants(), "flex-1 rounded-full")}
          >
            View Profile
          </a>

          <Button
            variant={favorited ? "secondary" : "outline"}
            className="rounded-full"
            aria-pressed={favorited}
            onClick={() =>
              favorited ? removeFavorite(user.id) : addFavorite(user)
            }
          >
            <Heart className={favorited ? "fill-red-500 text-red-500" : ""} />
            {favorited ? "Favourite" : "Add Favourite"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
