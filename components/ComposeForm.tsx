"use client";

import { useState } from "react";
import { useAppState } from "@/store/appState";

export default function ComposeForm() {
  const { composeDraft, setComposeDraft, resetComposeDraft, setView } = useAppState();
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(composeDraft),
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
    <div className="flex-1 p-8 bg-white">
      <h1 className="text-xl font-bold text-zinc-900 mb-6">New Message</h1>
      <form onSubmit={handleSend} className="flex flex-col gap-4 max-w-2xl">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 mb-1">To</label>
          <input
            type="email"
            required
            value={composeDraft.to}
            onChange={(e) => setComposeDraft({ to: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-zinc-800 focus:outline-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 mb-1">Subject</label>
          <input
            type="text"
            required
            value={composeDraft.subject}
            onChange={(e) => setComposeDraft({ subject: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-zinc-800 focus:outline-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 mb-1">Message</label>
          <textarea
            rows={10}
            required
            value={composeDraft.body}
            onChange={(e) => setComposeDraft({ body: e.target.value })}
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
            onClick={() => setView("inbox")}
            className="px-4 py-2.5 text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}