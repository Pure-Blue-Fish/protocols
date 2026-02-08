// ABOUTME: Floating chat widget with slide-out panel
// ABOUTME: Handles streaming responses and localStorage persistence

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Language } from "@/lib/protocols";
import ChatMessage from "./ChatMessage";
import { useToast } from "@/components/ui/Toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ToolResult {
  success: boolean;
  message: string;
  error?: string;
}

const STORAGE_KEY = "pbf-chat-history";
const MAX_MESSAGES = 50;

interface ChatWidgetProps {
  lang: Language;
  placeholder: string;
  title: string;
}

export default function ChatWidget({ lang, placeholder, title }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isRTL = lang === "he";

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${lang}`);
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, [lang]);

  // Save to localStorage (max 50 messages)
  useEffect(() => {
    if (messages.length > 0) {
      const trimmed = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(`${STORAGE_KEY}-${lang}`, JSON.stringify(trimmed));
    }
  }, [messages, lang]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, lang }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantContent = "";

      // Add placeholder for streaming
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                assistantContent += data.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return updated;
                });
              }
              // Handle tool call notification
              if (data.toolCall) {
                const toolName = data.toolCall.name;
                setToolStatus(
                  lang === "he"
                    ? toolName === "edit_protocol"
                      ? "מעדכן פרוטוקול..."
                      : "יוצר פרוטוקול..."
                    : toolName === "edit_protocol"
                      ? "Updating protocol..."
                      : "Creating protocol..."
                );
              }
              // Handle tool result
              if (data.toolResult) {
                setToolStatus(null);
                const result = data.toolResult as ToolResult;
                toast(result.success ? "success" : "error", result.message);
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: lang === "he" ? "שגיאה. נסה שוב." : "Error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, lang, isLoading]);

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(`${STORAGE_KEY}-${lang}`);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} w-14 h-14 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full shadow-elevated flex items-center justify-center transition-transform hover:scale-105 z-40 no-print`}
        aria-label="Open chat"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Slide-out Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 no-print">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} h-full w-full sm:w-96 bg-surface-card shadow-modal flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-default">
              <h2 className="font-semibold font-heading">{title}</h2>
              <div className="flex gap-2">
                <button
                  onClick={clearHistory}
                  className="p-2 text-text-muted hover:text-text-secondary"
                  title={lang === "he" ? "נקה היסטוריה" : "Clear history"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-text-muted hover:text-text-secondary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 && (
                <p className="text-text-muted text-center text-sm mt-8">
                  {lang === "he"
                    ? "שאל אותי על הפרוטוקולים"
                    : "Ask me about the protocols"}
                </p>
              )}
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} isRTL={isRTL} />
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
                  <div className="bg-surface-subtle rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-text-muted rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-text-muted rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {toolStatus && (
                <div className={`flex ${isRTL ? "justify-end" : "justify-start"} mt-2`}>
                  <div className="bg-brand-primary-light text-brand-primary rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {toolStatus}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border-default">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={placeholder}
                  className="flex-1 px-4 py-2 border border-border-default rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-brand-primary-hover transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
