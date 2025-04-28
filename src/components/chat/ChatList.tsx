
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatPreview } from "./ChatPreview";
import { useChats } from "@/hooks/useChats";

export function ChatList() {
  const [search, setSearch] = useState("");
  const { chats, activeChat, setActiveChat, loading } = useChats();
  
  // Filtra as conversas com base na pesquisa
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(search.toLowerCase()) ||
    chat.phone.includes(search)
  );

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
          {loading ? (
            // Placeholder de carregamento
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="w-full p-3 rounded-lg">
                <div className="flex items-start gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <ChatPreview 
                key={chat.id} 
                chat={chat} 
                isActive={chat.id === activeChat}
                onClick={() => setActiveChat(chat.id)} 
              />
            ))
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              {search ? "Nenhuma conversa encontrada" : "Nenhuma conversa disponível"}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
