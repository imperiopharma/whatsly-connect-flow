
import { cn } from "@/lib/utils";

interface ChatPreviewProps {
  chat: {
    id: string;
    name: string;
    phone: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    status: "active" | "ended";
  };
  isActive: boolean;
  onClick: () => void;
}

export function ChatPreview({ chat, isActive, onClick }: ChatPreviewProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 rounded-lg text-left transition-colors hover:bg-accent group",
        isActive && "bg-accent",
        chat.status === "active" && !isActive && "bg-accent/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-medium">
            {chat.name.split(" ").map(n => n[0]).join("")}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium truncate">{chat.name}</p>
            <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
        </div>
        {chat.unread > 0 && (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-whatsapp text-white text-xs flex items-center justify-center">
            {chat.unread}
          </div>
        )}
      </div>
    </button>
  );
}
