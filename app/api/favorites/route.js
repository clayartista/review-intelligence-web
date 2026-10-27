import { addFavorite, getAllFavorites } from "@/lib/services/favoriteService";

export async function GET() {
  return Response.json(await getAllFavorites());
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await addFavorite(body);

    if (!result.success) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    return Response.json({ data: result.data }, { status: result.status });
  } catch (error) {
    return Response.json(
      { error: "Format JSON tidak valid" },
      { status: 400 }
    );
  }
}