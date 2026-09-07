import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/authHelper";
import { listMessages } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  // Extract account credentials from incoming headers
  const userEmail = request.headers.get("x-user-email");
  const userPassword = request.headers.get("x-user-password");

  let auth: any = null;

  try {
    // Attempt authentication using header credentials or fallback client helper
    auth = await (getAuthenticatedClient as any)({
      email: userEmail || undefined,
      password: userPassword || undefined,
      request,
    });
  } catch (err) {
    console.error("Authentication setup error:", err);
  }

  if (!auth) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in with a valid account." },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || undefined;
  const labelIdsParam = searchParams.get("labelIds");
  const labelIds = labelIdsParam ? labelIdsParam.split(",") : undefined;

  try {
    const messages = await listMessages(auth, { q, labelIds });
    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Error fetching messages for account:", userEmail, error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve messages." },
      { status: 500 }
    );
  }
}