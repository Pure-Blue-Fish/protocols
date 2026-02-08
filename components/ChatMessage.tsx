// ABOUTME: Chat message bubble component
// ABOUTME: Handles user vs assistant styling with RTL support

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isRTL: boolean;
}

export default function ChatMessage({ role, content, isRTL }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${isUser ? (isRTL ? "justify-start" : "justify-end") : isRTL ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          isUser ? "bg-brand-primary text-white" : "bg-surface-subtle text-text-primary"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
