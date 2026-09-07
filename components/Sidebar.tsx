"use client";

import { useAppState, ViewMode } from "@/store/appState";

export default function Sidebar() {
  const { view, setView, resetComposeDraft } = useAppState();

  const handleCompose = () => {
    resetComposeDraft();
    setView("compose");
  };

  const navItems: { label: string; mode: ViewMode; icon: string }[] = [
    {
      label: "Inbox",
      mode: "inbox",
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    },
    {
      label: "Starred",
      mode: "starred",
      icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    },
    {
      label: "Sent",
      mode: "sent",
      icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
    },
    {
      label: "Drafts",
      mode: "drafts",
      icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    },
    {
      label: "Trash",
      mode: "trash",
      icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    },
  ];

  return (
    <aside className="w-64 border-r border-sky-100 bg-sky-50/50 p-4 flex flex-col justify-between h-full select-none">
      <div>
        {/* Action Button */}
        <button
          onClick={handleCompose}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:scale-[0.98] transition-all mb-4"
        >
          <span className="text-lg font-normal">+</span>
          New Email
        </button>

        {/* Sidebar Navigation Links (Working State & Actions) */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = view === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => setView(item.mode)}
                className={`w-full flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sky-200/60 text-teal-950 font-semibold shadow-sm"
                    : "text-teal-800 hover:bg-sky-100/60 hover:text-teal-900"
                }`}
              >
                <svg
                  className={`w-5 h-5 ${
                    isActive ? "text-teal-700" : "text-teal-600/80"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}