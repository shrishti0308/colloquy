import { API_CONFIG } from "@/config/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward to backend logger endpoint
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/logs/frontend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Don't wait for backend response - fire and forget
    if (!response.ok) {
      // Just return success to frontend anyway
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Don't log this error (would cause infinite loop)
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
