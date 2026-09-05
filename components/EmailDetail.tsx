"use client";

import { useAppState } from "@/store/appState";

export default function EmailDetail() {
  const { selectedEmail, setView, setComposeDraft } = useAppState();

  if (!selectedEmail) {
    return (
      <div className="flex-1 p-8 text-zinc-400 flex justify-center items-center">
        No email selected.
      </div>
    );
  }

  const handleReply = () => {
    setComposeDraft({
      to: selectedEmail.from,
      subject: selectedEmail.subject.startsWith("Re:")
        ? selectedEmail.subject
        : `Re: ${selectedEmail.subject}`,
      body: `\n\n--- On ${selectedEmail.date}, ${selectedEmail.from} wrote:\n> ${selectedEmail.snippet}`,
    });
    setView("compose");
  };

  return (
    <div className="flex-1 p-8 bg-white overflow-y-auto flex flex-col gap-6">
      <div className="border-b pb-4">
        <button
          onClick={() => setView("inbox")}
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-zinc-900">{selectedEmail.subject}</h1>
        <div className="flex justify-between items-center mt-2 text-sm text-zinc-500">
          <div>
            <span className="font-medium text-zinc-800">From:</span> {selectedEmail.from}
          </div>
          <div>{new Date(selectedEmail.date).toLocaleString()}</div>
        </div>
      </div>

      <div
        className="text-zinc-800 whitespace-pre-wrap leading-relaxed text-sm"
        dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
      />

      <div className="pt-4 border-t">
        <button
          onClick={handleReply}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          Reply
        </button>
      </div>
    </div>
  );
}