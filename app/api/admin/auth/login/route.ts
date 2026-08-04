import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  authenticateAdminCredentials,
  createAdminSessionToken,
} from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      password?: string;
      username?: string;
    };
    const session = authenticateAdminCredentials(
      body.username || "",
      body.password || "",
    );

    if (!session) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      role: session.role,
      username: session.username,
    });

    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      createAdminSessionToken(session),
      {
        httpOnly: true,
        maxAge: 60 * 60 * 12,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      },
    );

    return response;
  } catch (error) {
    console.error("Error creating admin session:", error);

    return NextResponse.json(
      { error: "Admin authentication is not configured" },
      { status: 500 },
    );
  }
}
