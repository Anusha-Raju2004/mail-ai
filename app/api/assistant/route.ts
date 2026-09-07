import { NextRequest, NextResponse } from "next/server";
import { processAssistantRequest } from "@/lib/ai/assistant";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, context, history } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required and must be a string." },
        { status: 400 }
      );
    }

    // Process request through your AI utility
    let res: any = null;
    try {
      res = await processAssistantRequest(
        prompt,
        context || {},
        history || []
      );
    } catch (aiError: any) {
      console.error("Error in processAssistantRequest:", aiError);
      // Soft fallback so the client fetch doesn't hard-crash with standard network error
      return NextResponse.json({
        success: true,
        message: "I encountered an issue processing that AI request. Please check your API key or network connection.",
        actions: [],
      });
    }

    // Ensure res is an object
    res = res || {};

    // Normalize single action or array of actions
    let rawActions = res.actions || (res.action ? [res.action] : []);

    const normalizedActions = rawActions.map((act: any) => {
      if (act?.payload) {
        const payload = act.payload;
        const extractedBody =
          payload.body ||
          payload.message ||
          payload.text ||
          payload.content ||
          payload.replyBody ||
          "";

        return {
          ...act,
          payload: {
            ...payload,
            body: extractedBody,
          },
        };
      }
      return act;
    });

    // Extract reply text reliably across common AI response structures
    const replyMessage =
      res.message ||
      res.reply ||
      res.response ||
      res.text ||
      "Request processed successfully.";

    return NextResponse.json(
      {
        success: true,
        message: replyMessage,
        actions: normalizedActions,
        action: normalizedActions[0] || null, // Backwards compatibility for single-action handlers
        data: res,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
    console.error("Assistant Route Fatal Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong on the server.",
        error: err?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}