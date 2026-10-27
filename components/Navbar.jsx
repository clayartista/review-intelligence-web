"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorite } from "@/context/FavoriteContext";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/profile", label: "Profile" },
  { href: "/contact", label: "Contact" },
];

const pillLinkClass = (isActive) =>
  cn(
    "rounded-full px-3 py-1.5 transition-colors hover:text-foreground",
    isActive && "bg-foreground/10 text-foreground"
  );

export default function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const { name, submitted } = useUser();
  // Hitung jumlah favorit untuk ditampilkan di Navbar
  const { favorites } = useFavorite();

  const favoritesLink = {
  href: "/favorites", // update with your actual route
  label: "Favorites",
  };

  // Menu Favorite baru muncul setelah ada user yang difavoritkan
  const navLinks =
    favorites.length > 0
      ? [...links, { href: "/favorites", label: `Favorite (${favorites.length})` }]
      : links;

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-4xl px-4">
      <nav className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-background/70 px-4 py-2 shadow-lg shadow-black/20 backdrop-blur-xl">
        <Link href="/" className="shrink-0 text-sm font-bold tracking-tight">
          MyWebsite
        </Link>

        <div className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 transition-colors hover:text-foreground",
                  isActive && "bg-foreground/10 text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* ← tombol "Get in touch" diganti dengan Login / Logout */}
        {isLoggedIn ? (
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "rounded-full"
              )}
            >
              Logout
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-full",
              pillLinkClass(pathname?.startsWith("/login"))
            )}
          >
            Login
          </Link>
        )}

          <Link
            href={favoritesLink.href}
            className={pillLinkClass(pathname?.startsWith(favoritesLink.href))}
          >
            {favoritesLink.label}
          </Link>
 
          <Link
            href="/vision"
            className={cn(
            buttonVariants({ size: "sm" }),
            "rounded-full bg-emerald-500 text-white hover:bg-emerald-600 whitespace-nowrap"
        )}
          >
            Try Our Detection System
        </Link>
        {submitted && <span>Hi, {name} 👋</span>}
        <Link
          href="/contact"
          className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
        >
          Get in touch
        </Link>
      </nav>
    </header>
  );
}
