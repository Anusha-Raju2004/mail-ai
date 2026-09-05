import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/authHelper";
import { sendMessage } from "@/lib/gmail";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, body" },
        { status: 400 }
      );
    }

    const result = await sendMessage(auth, { to, subject, body });
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}