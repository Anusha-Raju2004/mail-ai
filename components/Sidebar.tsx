"use client";

import { useAppState } from "@/store/appState";

export default function Sidebar() {
  const { view, setView, resetComposeDraft } = useAppState();

  const handleComposeClick = () => {
    resetComposeDraft();
    setView("compose");
  };

  return (
    <aside className="w-64 bg-zinc-900 text-white p-6 flex flex-col gap-6 min-h-screen">
      <h2 className="text-xl font-bold text-blue-400">Nebula Mail AI</h2>

      <button
        onClick={handleComposeClick}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
      >
        <span>+</span> New Email
      </button>

      <nav className="flex flex-col gap-2">
        <button
          onClick={() => setView("inbox")}
          className={`w-full text-left px-4 py-2.5 rounded-lg transition ${
            view === "inbox"
              ? "bg-zinc-800 font-semibold text-blue-400"
              : "hover:bg-zinc-800 text-zinc-300"
          }`}
        >
          Inbox
        </button>
        <button
          onClick={() => setView("sent")}
          className={`w-full text-left px-4 py-2.5 rounded-lg transition ${
            view === "sent"
              ? "bg-zinc-800 font-semibold text-blue-400"
              : "hover:bg-zinc-800 text-zinc-300"
          }`}
        >
          Sent
        </button>
      </nav>
    </aside>
  );
}