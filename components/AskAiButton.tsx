"use client";

export default function AskAiButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-sky-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-400/30 hover:bg-sky-500 active:scale-95 transition-all"
    >
      Ask AI
    </button>
  );
}