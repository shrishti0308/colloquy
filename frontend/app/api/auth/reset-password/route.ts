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

    // Call backend reset-password endpoint
    const response = await fetch(
      `${API_CONFIG.BACKEND_URL}/auth/reset-password`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    logger.error("Reset password route error:", "API Route", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
