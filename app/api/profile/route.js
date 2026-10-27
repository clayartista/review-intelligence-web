import { NextResponse } from 'next/server';

export async function GET() {
  const profileData = {
    name: "Ririn",
    role: "peserta bootcamp",
    favoriteTech: ["Next.js", "ComfyUI"]
  };

  return NextResponse.json(profileData);
}