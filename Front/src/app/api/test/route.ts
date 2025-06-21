import { NextResponse } from "next/server"

export async function GET() {
  console.log("🎯 API Test endpoint called!")

  return NextResponse.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    path: "/api/test",
  })
}
