"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useAppState, ViewMode } from "@/store/appState";
import { MessageSummary } from "@/lib/gmail";
import Sidebar from "@/components/Sidebar";
import Filters from "@/components/Filters";
import EmailList from "@/components/EmailList";
import EmailDetail from "@/components/EmailDetail";
import ComposeForm from "@/components/ComposeForm";
import AssistantChat from "@/components/AssistantChat";
import SignIn from "@/components/SignIn";
import AccountMenu from "@/components/AccountMenu";

function decodeHTMLEntities(text: string): string {
  if (!text) return "";
  if (typeof window === "undefined") return text;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export default function Home() {
  const {
    isAuthenticated,
    user,
    setUser,
    view,
    setView,
    emails,
    setEmails,
    openEmailId,
    setOpenEmailId,
    selectedEmail,
    setSelectedEmail,
    filters,
    setFilters,
    composeDraft,
    setComposeDraft,
    setLoading,
  } = useAppState();

  const [localAuth, setLocalAuth] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isUserLoggedIn = isAuthenticated || localAuth;

  const animateText = useCallback(
    (fullText: string, onUpdate: (text: string) => void) => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      let currentLength = 0;

      typingIntervalRef.current = setInterval(() => {
        if (currentLength <= fullText.length) {
          onUpdate(fullText.slice(0, currentLength));
          currentLength++;
        } else {
          if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        }
      }, 15);
    },
    []
  );

  const buildQueryString = useCallback(
    (f = filters) => {
      const parts: string[] = [];
      if (f.keyword) parts.push(f.keyword);
      if (f.sender) parts.push(`from:${f.sender}`);
      if (f.unreadOnly) parts.push("is:unread");
      if (f.starredOnly) parts.push("is:starred");
      if (f.startDate) parts.push(`after:${f.startDate.replace(/-/g, "/")}`);
      if (f.endDate) parts.push(`before:${f.endDate.replace(/-/g, "/")}`);
      return parts.join(" ");
    },
    [filters]
  );

  const fetchEmailsWithQuery = useCallback(
    async (query: string, label = "INBOX") => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (label) params.append("labelIds", label);
        if (query) params.append("q", query);

        const res = await fetch(`/api/gmail/messages?${params.toString()}`, {
          headers: {
            "x-user-email": user?.email || "",
            "x-user-password": (user as any)?.password || "",
          },
        });

        if (res.redirected || !res.ok) {
          console.warn("Unauthenticated request or endpoint error.");
          setEmails([]);
          return [];
        }

        const data = await res.json();
        if (data.messages) {
          const cleanedMessages = data.messages.map((m: MessageSummary) => ({
            ...m,
            snippet: decodeHTMLEntities(m.snippet || ""),
            subject: decodeHTMLEntities(m.subject || ""),
          }));
          setEmails(cleanedMessages);
          return cleanedMessages;
        } else {
          setEmails([]);
        }
      } catch (err) {
        console.error("Failed to fetch emails:", err);
        setEmails([]);
      } finally {
        setLoading(false);
      }
      return [];
    },
    [setEmails, setLoading, user]
  );

  const fetchEmails = useCallback((targetView = view) => {
    const q = buildQueryString();
    let labelIds = "INBOX";
    if (targetView === "sent") labelIds = "SENT";
    if (targetView === "trash") labelIds = "TRASH";
    if (targetView === "drafts") labelIds = "DRAFT";
    if (targetView === "starred") labelIds = "STARRED";

    return fetchEmailsWithQuery(q, labelIds);
  }, [buildQueryString, view, fetchEmailsWithQuery]);

  useEffect(() => {
    if (isUserLoggedIn && ["inbox", "sent", "trash", "drafts", "starred"].includes(view)) {
      setSelectedEmail(null);
      setOpenEmailId(null);
      fetchEmails(view);
    }
  }, [view, user?.email, fetchEmails, isUserLoggedIn, setSelectedEmail, setOpenEmailId]);

  const handleAssistantAction = useCallback(
    async (actionOrActions: any) => {
      if (!actionOrActions) return;

      const actionsToExecute = Array.isArray(actionOrActions)
        ? actionOrActions
        : [actionOrActions];

      for (const action of actionsToExecute) {
        if (!action || !action.type) continue;

        switch (action.type) {
          case "NAVIGATE_VIEW": {
            if (action.payload?.folder) {
              const targetFolder = action.payload.folder.toLowerCase() as ViewMode;
              setView(targetFolder);
              setSelectedEmail(null);
              setOpenEmailId(null);
              await fetchEmails(targetFolder);
            }
            break;
          }

          case "OPEN_EMAIL_BY_QUERY": {
            const { query: searchQuery, folder } = action.payload || {};
            setLoading(true);

            try {
              const targetFolder = (folder || view || "inbox").toLowerCase();
              setView(targetFolder as ViewMode);

              const fetchedEmails = await fetchEmailsWithQuery(searchQuery, targetFolder.toUpperCase());

              if (fetchedEmails && fetchedEmails.length > 0) {
                const targetId = fetchedEmails[0].id;

                const res = await fetch(`/api/gmail/messages/${targetId}`, {
                  headers: {
                    "x-user-email": user?.email || "",
                    "x-user-password": (user as any)?.password || "",
                  },
                });

                if (res.ok) {
                  const data = await res.json();
                  const fullEmail = data.message || data.email || data;

                  setSelectedEmail({
                    ...fullEmail,
                    snippet: decodeHTMLEntities(fullEmail.snippet || ""),
                    subject: decodeHTMLEntities(fullEmail.subject || ""),
                    body: decodeHTMLEntities(fullEmail.body || fullEmail.snippet || ""),
                  });
                  setOpenEmailId(targetId);
                  setView("detail");
                }
              } else {
                setSelectedEmail(null);
                setOpenEmailId(null);
              }
            } catch (err) {
              console.error("Failed to query and open email:", err);
            } finally {
              setLoading(false);
            }
            break;
          }

          case "OPEN_EMAIL": {
            if (action.payload?.emailId) {
              const targetId = action.payload.emailId;
              setLoading(true);
              try {
                const res = await fetch(`/api/gmail/messages/${targetId}`, {
                  headers: {
                    "x-user-email": user?.email || "",
                    "x-user-password": (user as any)?.password || "",
                  },
                });

                if (res.redirected || !res.ok) {
                  return;
                }

                const data = await res.json();
                const fullEmail = data.message || data.email || data;

                if (fullEmail && fullEmail.id && !fullEmail.error) {
                  setSelectedEmail({
                    ...fullEmail,
                    snippet: decodeHTMLEntities(fullEmail.snippet || ""),
                    subject: decodeHTMLEntities(fullEmail.subject || ""),
                    body: decodeHTMLEntities(fullEmail.body || fullEmail.snippet || ""),
                  });
                } else {
                  throw new Error("Invalid response format");
                }
              } catch (err) {
                console.error("Failed to fetch target email details:", err);
                const fallback = emails.find((e: MessageSummary) => e.id === targetId);
                if (fallback) {
                  setSelectedEmail({
                    ...fallback,
                    body: decodeHTMLEntities(fallback.snippet || "No content available."),
                  });
                }
              } finally {
                setLoading(false);
                setOpenEmailId(targetId);
                setView("detail");
              }
            }
            break;
          }

          case "COMPOSE_EMAIL":
          case "FORWARD_EMAIL":
          case "REPLY_TO_EMAIL": {
            const activeEmail =
              selectedEmail ||
              emails.find((e: MessageSummary) => e.id === openEmailId) ||
              (action.payload?.emailId
                ? emails.find((e: MessageSummary) => e.id === action.payload.emailId)
                : null);

            const recipient = action.payload?.to || activeEmail?.from || "";

            const draftSubject =
              action.payload?.subject ||
              (activeEmail?.subject
                ? activeEmail.subject.toLowerCase().startsWith("re:")
                  ? activeEmail.subject
                  : `Re: ${activeEmail.subject}`
                : "");

            const rawBody =
              action.payload?.body ??
              action.payload?.message ??
              action.payload?.text ??
              action.payload?.content ??
              "";

            const cleanBody = decodeHTMLEntities(typeof rawBody === "string" ? rawBody.trim() : "");

            setView("compose");
            setPendingConfirmation(true);

            if (action.payload?.animateFill && cleanBody) {
              setComposeDraft({
                to: recipient,
                subject: draftSubject,
                body: "",
              });

              animateText(cleanBody, (typedBody) => {
                setComposeDraft({
                  to: recipient,
                  subject: draftSubject,
                  body: typedBody,
                });
              });
            } else {
              setComposeDraft({
                to: recipient,
                subject: draftSubject,
                body: cleanBody,
              });
            }
            break;
          }

          case "CONFIRM_SEND": {
            if (!composeDraft.to || !composeDraft.body) {
              alert("Cannot send email: Missing recipient or body context.");
              return;
            }

            setLoading(true);
            try {
              const res = await fetch("/api/gmail/send", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-user-email": user?.email || "",
                  "x-user-password": (user as any)?.password || "",
                },
                body: JSON.stringify(composeDraft),
              });

              if (res.ok) {
                setPendingConfirmation(false);
                setComposeDraft({ to: "", subject: "", body: "" });
                setView("inbox");
                fetchEmails("inbox");
              } else {
                alert("Failed to send email. Please check your network connection.");
              }
            } catch (err) {
              console.error("Failed to send email:", err);
            } finally {
              setLoading(false);
            }
            break;
          }

          case "FILTER_EMAILS": {
            if (action.payload) {
              setFilters({ ...filters, ...action.payload });
              if (view === "detail" || view === "compose") {
                setView("inbox");
              }
              fetchEmails();
            }
            break;
          }

          case "TOGGLE_STAR": {
            const targetId = action.payload?.emailId || openEmailId;
            if (targetId) {
              setEmails(
                emails.map((e: MessageSummary) =>
                  e.id === targetId ? { ...e, isStarred: !e.isStarred } : e
                )
              );
              if (selectedEmail && selectedEmail.id === targetId) {
                setSelectedEmail({
                  ...selectedEmail,
                  isStarred: !selectedEmail.isStarred,
                });
              }
            }
            break;
          }

          case "MARK_READ": {
            const targetId = action.payload?.emailId || openEmailId;
            const isRead = action.payload?.isRead ?? true;
            if (targetId) {
              setEmails(
                emails.map((e: MessageSummary) =>
                  e.id === targetId ? { ...e, isRead } : e
                )
              );
              if (selectedEmail && selectedEmail.id === targetId) {
                setSelectedEmail({
                  ...selectedEmail,
                  isRead,
                });
              }
            }
            break;
          }

          case "DELETE_EMAIL": {
            const targetId = action.payload?.emailId || openEmailId;
            if (targetId) {
              setEmails(emails.filter((e: MessageSummary) => e.id !== targetId));
              if (openEmailId === targetId || selectedEmail?.id === targetId) {
                setOpenEmailId(null);
                setSelectedEmail(null);
                setView("inbox");
              }
            }
            break;
          }

          default:
            console.log("Unhandled AI action:", action.type);
        }
      }
    },
    [
      setView,
      setComposeDraft,
      setOpenEmailId,
      setSelectedEmail,
      setFilters,
      filters,
      fetchEmails,
      fetchEmailsWithQuery,
      setEmails,
      emails,
      openEmailId,
      selectedEmail,
      setLoading,
      view,
      composeDraft,
      animateText,
      user,
    ]
  );

  if (!isUserLoggedIn) {
    return (
      <SignIn
        onSignIn={(userEmail: string) => {
          if (setUser) {
            setUser({
              email: userEmail,
              name: userEmail.split("@")[0] || "User",
            });
          }
          setLocalAuth(true);
          setView("inbox");
          fetchEmails("inbox");
        }}
      />
    );
  }

  return (
    <main className="flex h-screen flex-col bg-teal-50/30 text-teal-950 relative font-sans">
      <header className="flex h-16 items-center justify-between border-b border-teal-100/80 px-4 bg-white z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 select-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-lg shadow-sm">
              M
            </div>
            <span className="text-xl font-semibold text-teal-950 tracking-tight">Mail AI</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search mail"
              value={filters.keyword}
              onChange={(e) => setFilters({ keyword: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchEmails();
              }}
              className="w-full rounded-full bg-teal-50/60 border border-teal-100/60 py-2.5 pl-10 pr-4 text-sm text-teal-950 placeholder-teal-600/60 focus:bg-white focus:border-teal-300 focus:shadow-md focus:outline-none transition-all"
            />
            <svg
              className="w-4 h-4 text-teal-600/70 absolute left-3.5 top-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowAccountMenu((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-medium text-white ring-2 ring-teal-200 hover:ring-teal-400 focus:outline-none transition-all"
          >
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
          </button>
          {showAccountMenu && <AccountMenu onClose={() => setShowAccountMenu(false)} />}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {["inbox", "sent", "trash", "drafts", "starred"].includes(view) && (
            <Filters onApplyFilters={fetchEmails} />
          )}
          <div className="flex-1 flex overflow-hidden">
            {["inbox", "sent", "trash", "drafts", "starred"].includes(view) && (
              <EmailList />
            )}
            {view === "detail" && <EmailDetail />}
            {view === "compose" && <ComposeForm />}
          </div>
        </div>

        <AssistantChat
          currentContext={{
            view,
            openEmailId,
            pendingConfirmation,
            visibleEmailsSummary: emails.map((e: MessageSummary) => ({
              id: e.id,
              subject: e.subject,
              snippet: e.snippet,
            })),
          }}
          onExecuteAction={handleAssistantAction}
        />
      </div>
    </main>
  );
}