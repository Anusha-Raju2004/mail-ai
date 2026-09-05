import { NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/googleClient";

export async function GET() {
  const oauth2Client = getOAuthClient();

  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  return NextResponse.redirect(url);
}