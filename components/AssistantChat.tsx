"use client";

import { useState } from "react";

export default function AssistantChat({
  currentContext,
  onExecuteAction,
}: {
  currentContext?: any;
  onExecuteAction?: (action: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMsg = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg.content,
          context: currentContext || {},
          history: messages,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", res.status, errorText);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error ${res.status}: Failed to reach service.` },
        ]);
        return;
      }

      const data = await res.json();

      if (data.message) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      }

      if (Array.isArray(data.actions) && data.actions.length > 0 && onExecuteAction) {
        data.actions.forEach((action: any) => onExecuteAction(action));
      }
    } catch (err) {
      console.error("Failed to reach assistant:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please check your console." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-600 text-white font-medium px-6 py-2.5 text-sm shadow-md transition-all active:scale-95"
        >
          Ask AI
        </button>
      ) : (
        <div className="w-96 h-[500px] bg-white border border-gray-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold text-sm">Mail AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 text-sm">
            {messages.length === 0 && (
              <p className="text-gray-500 text-xs text-center mt-8">
                How can I assist with your emails today?
              </p>
            )}
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl max-w-[85%] ${
                  m.role === "user"
                    ? "bg-sky-500 text-white ml-auto"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && <p className="text-xs text-gray-400">Thinking...</p>}
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask AI..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-black"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-sky-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-sky-600 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}