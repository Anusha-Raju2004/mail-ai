import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/authHelper";
import { getMessage } from "@/lib/gmail";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const message = await getMessage(auth, id);
    return NextResponse.json({ message });
  } catch (error: any) {
    console.error("Error fetching message detail:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}