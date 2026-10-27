import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Vision API active" });
}

export async function POST(req) {
  // logik POST Anda
  return NextResponse.json({ success: true });
}