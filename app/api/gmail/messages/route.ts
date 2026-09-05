import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/authHelper";
import { listMessages } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || undefined;
  const labelIdsParam = searchParams.get("labelIds");
  const labelIds = labelIdsParam ? labelIdsParam.split(",") : undefined;

  try {
    const messages = await listMessages(auth, { q, labelIds });
    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}