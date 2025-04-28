
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatPreview } from "./ChatPreview";

export function ChatList() {
  const [search, setSearch] = useState("");

  return (
    <div className="w-80 flex-shrink-0 border rounded-lg bg-card">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-2 space-y-2">
          {dummyChats.map((chat) => (
            <ChatPreview key={chat.id} chat={chat} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

const dummyChats = [
  {
    id: "1",
    name: "João Silva",
    phone: "+55 11 98765-4321",
    lastMessage: "Olá, gostaria de saber mais sobre os serviços",
    timestamp: "10:30",
    unread: 2,
    status: "active" as const
  },
  {
    id: "2",
    name: "Maria Oliveira",
    phone: "+55 11 91234-5678",
    lastMessage: "Obrigado pelo atendimento!",
    timestamp: "09:45",
    unread: 0,
    status: "ended" as const
  },
  // Mais chats para demonstração
];
