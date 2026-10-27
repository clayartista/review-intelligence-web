import { removeFavorite } from "@/lib/services/favoriteService";
import { createClient } from "@/lib/supabase/server"

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const numId = Number(id);
  const result = await removeFavorite(numId);

  if (!result.success) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ message: "Berhasil dihapus" }, { status: result.status });
}