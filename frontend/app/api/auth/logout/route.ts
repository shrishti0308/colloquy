import { API_CONFIG } from "@/config/constants";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken) {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
        credentials: "include",
      });
    }

    // Clear the refresh token cookie
    cookieStore.delete("refreshToken");

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
