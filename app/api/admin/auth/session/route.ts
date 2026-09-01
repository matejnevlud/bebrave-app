import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  const session = getAdminSession(request);

  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  return NextResponse.json({
    role: session.role,
    username: session.username,
  });
}
