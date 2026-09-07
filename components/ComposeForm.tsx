"use client";

import { useState, useEffect } from "react";
import { useAppState } from "@/store/appState";

export default function ComposeForm() {
  const { composeDraft, setComposeDraft, resetComposeDraft, setView } = useAppState();
  const [sending, setSending] = useState(false);

  const [to, setTo] = useState(composeDraft.to || "");
  const [subject, setSubject] = useState(composeDraft.subject || "");
  const [body, setBody] = useState(composeDraft.body || "");

  // Always force local state to match store draft on external updates
  useEffect(() => {
    setTo(composeDraft.to || "");
    setSubject(composeDraft.subject || "");
    setBody(composeDraft.body || "");
  }, [composeDraft.to, composeDraft.subject, composeDraft.body]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });

      if (res.ok) {
        resetComposeDraft();
        setView("inbox");
      } else {
        const data = await res.json();
        alert(`Failed to send email: ${data.error}`);
      }
    } catch (err) {
      console.error("Send error:", err);
      alert("Error sending email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-white overflow-y-auto">
      <h1 className="text-xl font-bold text-zinc-900 mb-6">New Message</h1>
      <form onSubmit={handleSend} className="flex flex-col gap-4 max-w-2xl">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 mb-1">To</label>
          <input
            type="text"
            required
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setComposeDraft({ to: e.target.value });
            }}
            className="w-full px-3 py-2 border rounded-lg text-zinc-800 focus:outline-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 mb-1">Subject</label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setComposeDraft({ subject: e.target.value });
            }}
            className="w-full px-3 py-2 border rounded-lg text-zinc-800 focus:outline-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 mb-1">Message</label>
          <textarea
            rows={10}
            required
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setComposeDraft({ body: e.target.value });
            }}
            className="w-full px-3 py-2 border rounded-lg text-zinc-800 focus:outline-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send"}
          </button>
          <button
            type="button"
            onClick={() => {
              resetComposeDraft();
              setView("inbox");
            }}
            className="px-4 py-2.5 text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}