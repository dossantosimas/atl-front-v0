import { NextResponse } from "next/server";

export async function GET() {
  // Retornar la hora actual del servidor de Next.js
  const serverTime = new Date().toISOString();
  
  return NextResponse.json({ time: serverTime });
}

