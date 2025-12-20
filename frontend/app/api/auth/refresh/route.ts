import { API_CONFIG } from "@/config/constants";
import { logger } from "@/services/logger.service";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Refresh token not found",
        },
        { status: 401 }
      );
    }

    // Call backend refresh endpoint
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to refresh token",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Forward the new refresh token cookie from backend
    const setCookieHeader = response.headers.get("set-cookie");
    const nextResponse = NextResponse.json(data);

    if (setCookieHeader) {
      nextResponse.headers.set("set-cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    logger.error("Refresh token route error:", "API Route", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
