"use client";

import { useAppState } from "@/store/appState";

export default function EmailList() {
  const { emails, setOpenEmailId, setSelectedEmail, setView, setLoading, loading } =
    useAppState();

  const handleSelectEmail = async (id: string) => {
    setOpenEmailId(id);
    setLoading(true);

    try {
      const res = await fetch(`/api/gmail/messages/${id}`);
      const data = await res.json();
      if (data.message) {
        setSelectedEmail(data.message);
        setView("detail");
      }
    } catch (err) {
      console.error("Failed to load message:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center text-zinc-500">
        Loading messages...
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex-1 flex justify-center items-center text-zinc-400">
        No messages found.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-zinc-200 bg-white">
      {emails.map((email) => {
        const isUnread = email.labelIds?.includes("UNREAD");

        return (
          <div
            key={email.id}
            onClick={() => handleSelectEmail(email.id)}
            className={`p-4 hover:bg-zinc-50 cursor-pointer transition ${
              isUnread ? "bg-blue-50/40 font-semibold" : ""
            }`}
          >
            <div className="flex justify-between items-center text-xs text-zinc-500 mb-1">
              <span className="text-zinc-900 truncate max-w-xs">{email.from}</span>
              <span>{new Date(email.date).toLocaleDateString()}</span>
            </div>
            <div className="text-sm font-medium text-zinc-900 truncate">
              {email.subject || "(No Subject)"}
            </div>
            <div className="text-xs text-zinc-500 truncate mt-0.5">
              {email.snippet}
            </div>
          </div>
        );
      })}
    </div>
  );
}