"use client";

import { useEffect, useCallback } from "react";
import { useAppState } from "@/store/appState";
import Sidebar from "@/components/Sidebar";
import Filters from "@/components/Filters";
import EmailList from "@/components/EmailList";
import EmailDetail from "@/components/EmailDetail";
import ComposeForm from "@/components/ComposeForm";

export default function Home() {
  const { view, filters, setEmails, setLoading } = useAppState();

  const buildQueryString = useCallback(() => {
    const parts: string[] = [];
    if (filters.keyword) parts.push(filters.keyword);
    if (filters.sender) parts.push(`from:${filters.sender}`);
    if (filters.unreadOnly) parts.push("is:unread");
    if (filters.startDate) parts.push(`after:${filters.startDate.replace(/-/g, "/")}`);
    if (filters.endDate) parts.push(`before:${filters.endDate.replace(/-/g, "/")}`);
    return parts.join(" ");
  }, [filters]);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    const q = buildQueryString();
    const labelIds = view === "sent" ? "SENT" : "INBOX";

    try {
      const params = new URLSearchParams();
      if (labelIds) params.append("labelIds", labelIds);
      if (q) params.append("q", q);

      const res = await fetch(`/api/gmail/messages?${params.toString()}`);
      const data = await res.json();
      if (data.messages) {
        setEmails(data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch emails:", err);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString, view, setEmails, setLoading]);

  useEffect(() => {
    if (view === "inbox" || view === "sent") {
      fetchEmails();
    }
  }, [view, fetchEmails]);

  return (
    <main className="flex min-h-screen bg-zinc-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {(view === "inbox" || view === "sent") && (
          <Filters onApplyFilters={fetchEmails} />
        )}

        <div className="flex-1 flex overflow-hidden">
          {(view === "inbox" || view === "sent") && <EmailList />}
          {view === "detail" && <EmailDetail />}
          {view === "compose" && <ComposeForm />}
        </div>
      </div>
    </main>
  );
}