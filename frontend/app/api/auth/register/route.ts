import { buildBackendHeaders } from "@/app/api/headers";
import { API_CONFIG } from "@/config/constants";
import { logger } from "@/services/logger.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const headers = buildBackendHeaders(request, {
      "Content-Type": "application/json",
    });

    // Call backend register endpoint
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/auth/register`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Forward the refresh token cookie from backend
    const setCookieHeader = response.headers.get("set-cookie");
    const nextResponse = NextResponse.json(data, { status: 201 });

    if (setCookieHeader) {
      nextResponse.headers.set("set-cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    logger.error("Register route error:", "API Route", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
