import { NextRequest, NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/googleClient";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    const response = NextResponse.redirect(new URL("/", request.url));
    const isProd = process.env.NODE_ENV === "production";

    if (tokens.access_token) {
      response.cookies.set("google_access_token", tokens.access_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 3600,
      });
    }

    if (tokens.refresh_token) {
      response.cookies.set("google_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("Error exchanging OAuth code:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}