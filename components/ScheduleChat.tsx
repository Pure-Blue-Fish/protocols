// ABOUTME: AI chat panel for schedule management
// ABOUTME: Streams responses from OpenAI, triggers calendar refresh on tool execution

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { UI_STRINGS, type Language } from "@/lib/i18n";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ScheduleChatProps {
  lang: Language;
  week: string;
  onScheduleChange: () => void;
}

export default function ScheduleChat({
  lang,
  week,
  onScheduleChange,
}: ScheduleChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ui = UI_STRINGS[lang];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, toolStatus]);

  // Clear messages when week changes
  useEffect(() => {
    setMessages([]);
  }, [week]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setToolStatus(null);

    try {
      const res = await fetch("/api/schedule-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          week,
          lang,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Failed to connect");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let hadToolCall = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.text) {
              assistantText += parsed.text;
              setMessages([
                ...updatedMessages,
                { role: "assistant", content: assistantText },
              ]);
            }

            if (parsed.toolCall) {
              hadToolCall = true;
              const toolName = parsed.toolCall.name;
              const statusMap: Record<string, string> = {
                assign_task: "משבץ משימה...",
                remove_task: "מסיר שיבוץ...",
                copy_week: "מעתיק שבוע...",
                get_schedule: "מביא לוח...",
                clear_day: "מנקה יום...",
              };
              setToolStatus(statusMap[toolName] || `${toolName}...`);
            }

            if (parsed.toolResult) {
              setToolStatus(null);
              // Refresh calendar after any tool execution
              onScheduleChange();
            }

            if (parsed.error) {
              const errorMessages: Record<string, string> = {
                rate_limit: lang === "he"
                  ? "יותר מדי בקשות, נסה שוב בעוד דקה"
                  : "Too many requests, try again in a minute",
                auth_error: lang === "he"
                  ? "שגיאת אימות מול שרת ה-AI"
                  : "AI server authentication error",
                general_error: lang === "he"
                  ? "שגיאה, נסה שוב"
                  : "Error, please try again",
              };
              const errorMsg = errorMessages[parsed.error] || errorMessages.general_error;
              assistantText += assistantText ? `\n\n${errorMsg}` : errorMsg;
              setMessages([
                ...updatedMessages,
                { role: "assistant", content: assistantText },
              ]);
            }
          } catch {
            // Skip unparseable lines
          }
        }
      }
    } catch (error) {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "שגיאה בחיבור. נסה שוב." },
      ]);
    }

    setIsLoading(false);
    setToolStatus(null);
    // Re-focus the input after message completes
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [input, isLoading, messages, week, lang, onScheduleChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border-default">
        <h2 className="text-sm font-medium text-text-primary font-heading">
          {ui.scheduleChatTitle}
        </h2>
        <p className="text-xs text-text-muted mt-0.5">
          {week}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-text-muted py-8">
            <p className="mb-2">
              {lang === "he"
                ? 'תגיד לי מה צריך להיות השבוע. למשל:'
                : "Tell me what this week should look like. For example:"}
            </p>
            <div className="space-y-1 text-xs">
              <p className="bg-surface-subtle rounded px-3 py-1.5 inline-block">
                {lang === "he"
                  ? '"תעתיק מהשבוע הקודם"'
                  : '"Copy from last week"'}
              </p>
              <br />
              <p className="bg-surface-subtle rounded px-3 py-1.5 inline-block">
                {lang === "he"
                  ? '"שים את אודי על האכלה פיטום כל הבקרים"'
                  : '"Put Udi on fattening feed every morning"'}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-brand-primary text-white rounded-br-sm"
                  : "bg-surface-subtle text-text-primary rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Tool status */}
        {toolStatus && (
          <div className="flex justify-end">
            <div className="bg-amber-50 text-amber-700 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-amber-400 border-t-amber-700 rounded-full animate-spin" />
              {toolStatus}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !toolStatus && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-end">
            <div className="bg-surface-subtle px-3 py-2 rounded-xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border-default">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={ui.scheduleChatPlaceholder}
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-border-default rounded-lg text-base md:text-sm focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-transparent disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover disabled:opacity-50 text-sm transition-colors"
          >
            {lang === "he" ? "שלח" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
