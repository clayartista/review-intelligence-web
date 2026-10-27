import "./globals.css";

import localFont from "next/font/local";

import { UserProvider } from "@/context/UserContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { FavoriteProvider } from "@/context/FavoriteContext";
import { createClient } from "@/lib/supabase/server";
import ChatWidget from "@/components/ChatWidget";

const fontSans = localFont({
  src: [
    {
      path: "./fonts/PlusJakartaSans-Variable.woff2",
      style: "normal",
    },
    {
      path: "./fonts/PlusJakartaSans-Italic-Variable.woff2",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "MyWebsite — Build something meaningful",
  description:
    "We help individuals and businesses build modern, simple, and useful digital experiences.",
};

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en" suppressHydrationWarning
      className={`dark ${fontSans.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased" suppressHydrationWarning>
        <UserProvider>
          <AuthProvider user={user ? { id: user.id, email: user.email } : null}>
            <FavoriteProvider>
              <Navbar />
              <main className="flex-1">
                {children}
                <ChatWidget />
              </main>
              <Footer />
            </FavoriteProvider>
          </AuthProvider>
        </UserProvider>
      </body>
    </html>
  );
}