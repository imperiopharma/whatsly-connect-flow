
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    timestamp: string;
    type: "sent" | "received";
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex",
        message.type === "sent" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-3",
          message.type === "sent"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <p className="text-sm break-words">{message.content}</p>
        <p className="text-xs opacity-70 text-right mt-1">{message.timestamp}</p>
      </div>
    </div>
  );
}
