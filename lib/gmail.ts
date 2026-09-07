import { google, Auth } from "googleapis";

export interface MessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  labelIds?: string[];
  isStarred?: boolean;
  isRead?: boolean;
}

export interface DetailedMessage extends MessageSummary {
  body: string;
}

function getHeaderValue(headers: any[], name: string): string {
  const header = headers?.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
  return header ? header.value : "";
}

function decodeBodyData(data: string): string {
  if (!data) return "";
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

function getMessageBody(payload: any): string {
  if (!payload) return "";

  if (payload.body && payload.body.data) {
    return decodeBodyData(payload.body.data);
  }

  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body && part.body.data) {
        return decodeBodyData(part.body.data);
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body && part.body.data) {
        return decodeBodyData(part.body.data);
      }
    }
    for (const part of payload.parts) {
      const body = getMessageBody(part);
      if (body) return body;
    }
  }

  return "";
}

export async function listMessages(
  auth: Auth.OAuth2Client,
  params: { q?: string; labelIds?: string[]; maxResults?: number } = {}
): Promise<MessageSummary[]> {
  const gmail = google.gmail({ version: "v1", auth });
  const { q = "", labelIds, maxResults = 15 } = params;

  const listRes = await gmail.users.messages.list({
    userId: "me",
    q,
    labelIds,
    maxResults,
  });

  const messages = listRes.data.messages || [];
  if (messages.length === 0) return [];

  const summaries = await Promise.all(
    messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });

      const headers = detail.data.payload?.headers || [];
      const labels = detail.data.labelIds || [];

      return {
        id: msg.id!,
        threadId: msg.threadId!,
        snippet: detail.data.snippet || "",
        subject: getHeaderValue(headers, "Subject"),
        from: getHeaderValue(headers, "From"),
        date: getHeaderValue(headers, "Date"),
        labelIds: labels,
        isStarred: labels.includes("STARRED"),
        isRead: !labels.includes("UNREAD"),
      };
    })
  );

  return summaries;
}

export async function getMessage(
  auth: Auth.OAuth2Client,
  id: string
): Promise<DetailedMessage> {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "full",
  });

  const headers = res.data.payload?.headers || [];
  const body = getMessageBody(res.data.payload);
  const labels = res.data.labelIds || [];

  return {
    id: res.data.id!,
    threadId: res.data.threadId!,
    snippet: res.data.snippet || "",
    subject: getHeaderValue(headers, "Subject"),
    from: getHeaderValue(headers, "From"),
    date: getHeaderValue(headers, "Date"),
    labelIds: labels,
    isStarred: labels.includes("STARRED"),
    isRead: !labels.includes("UNREAD"),
    body,
  };
}

export async function sendMessage(
  auth: Auth.OAuth2Client,
  params: { to: string; subject: string; body: string }
) {
  const gmail = google.gmail({ version: "v1", auth });
  const { to, subject, body } = params;

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    body,
  ];
  const message = messageParts.join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return res.data;
}