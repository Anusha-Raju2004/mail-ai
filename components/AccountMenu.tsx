"use client";

import { useState } from "react";
import { useAppState } from "@/store/appState";

export default function AccountMenu({ onClose }: { onClose: () => void }) {
  const { user, setIsAuthenticated, setUser, setEmails, setSelectedEmail, setOpenEmailId } = useAppState();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSignOut = () => {
    setUser(null);
    setIsAuthenticated(false);
    setEmails([]);
    setSelectedEmail(null);
    setOpenEmailId(null);
    onClose();
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail.trim() && newPassword.trim()) {
      // Clear previous inbox state first
      setEmails([]);
      setSelectedEmail(null);
      setOpenEmailId(null);

      // Set new active user context with password metadata
      setUser({
        email: newEmail,
        name: newEmail.split("@")[0] || "User",
      });

      setShowAddAccount(false);
      onClose();
    }
  };

  return (
    <>
      <div className="absolute right-4 top-14 z-50 w-80 rounded-2xl bg-teal-50/80 p-4 shadow-xl border border-teal-200/70 text-teal-950 backdrop-blur-md">
        <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm border border-teal-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-lg font-medium text-white">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate text-teal-950">{user?.name || "User"}</p>
            <p className="text-xs text-teal-700/80 truncate">{user?.email || "user@mailai.com"}</p>
          </div>
        </div>

        <div className="mt-2 space-y-1">
          <button
            onClick={() => setShowAddAccount(true)}
            className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-xs font-medium text-teal-800 hover:bg-teal-100/50 border border-teal-100/50 transition-colors"
          >
            <span className="text-teal-600 font-bold">+</span> Add another account
          </button>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl bg-teal-100/60 px-4 py-3 text-xs font-medium text-teal-900 hover:bg-teal-200/50 transition-colors"
          >
            Sign out
          </button>
        </div>

        <button
          onClick={() => setShowPlans(true)}
          className="mt-2 w-full text-left rounded-xl bg-white p-3 border border-teal-100 hover:bg-teal-50/50 transition-colors"
        >
          <p className="text-xs font-medium text-teal-900">Get a Mail AI plan</p>
        </button>
      </div>

      {/* Add Account Modal with Password */}
      {showAddAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-teal-100">
            <h3 className="text-base font-bold text-teal-950">Add another account</h3>
            <p className="mt-1 text-xs text-teal-700/80">
              Enter email address and password to switch active account context.
            </p>
            <form onSubmit={handleAddAccountSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-teal-900 mb-1">Email ID</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-xl border border-teal-200 bg-teal-50/30 px-3.5 py-2.5 text-xs text-teal-950 outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-teal-900 mb-1">App Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-teal-200 bg-teal-50/30 px-3.5 py-2.5 text-xs text-teal-950 outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccount(false)}
                  className="rounded-xl px-3.5 py-2 text-xs font-medium text-teal-700 hover:bg-teal-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
                >
                  Switch Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mail AI Plan Modal */}
      {showPlans && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-teal-100">
            <div className="flex items-center justify-between border-b border-teal-50 pb-3">
              <h3 className="text-lg font-bold text-teal-950">Mail AI Plans</h3>
              <button
                onClick={() => setShowPlans(false)}
                className="text-teal-500 hover:text-teal-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4">
                <div className="flex justify-between text-sm font-bold text-sky-950">
                  <span>Pro Plan</span>
                  <span>$9.99/mo</span>
                </div>
                <p className="mt-1 text-xs text-sky-800/80">
                  Unlimited AI email drafts, automatic inbox filtering, and fast smart replies.
                </p>
              </div>
              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
                <div className="flex justify-between text-sm font-bold text-teal-950">
                  <span>Enterprise Plan</span>
                  <span>$24.99/mo</span>
                </div>
                <p className="mt-1 text-xs text-teal-800/80">
                  Dedicated AI assistant, custom backend integrations, and priority support.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPlans(false)}
              className="mt-5 w-full rounded-xl bg-teal-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}