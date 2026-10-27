import { connection } from "next/server";
import { supabase } from "@/lib/supabase";
import { deleteMessageAction } from "./actions";

export default async function MessagesPage() {
  await connection();

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-bold">Pesan Masuk</h1>
        <p className="mt-8 text-red-600">Gagal memuat pesan: {error.message}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold">Pesan Masuk</h1>

      <div className="mt-8 space-y-4">
        {messages.length === 0 ? (
          <p className="text-muted-foreground">Belum ada pesan masuk.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="font-medium">{msg.name} — {msg.email}</p>
                <p className="mt-1 text-sm text-muted-foreground">{msg.message}</p>
              </div>
              <form action={deleteMessageAction}>
                <input type="hidden" name="id" value={msg.id} />
                <button
                  type="submit"
                  className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                >
                  Hapus
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
