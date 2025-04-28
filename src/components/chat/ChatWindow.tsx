
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { useState } from "react";

export function ChatWindow() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex-1 border rounded-lg bg-card flex flex-col">
      <header className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">JS</span>
          </div>
          <div>
            <h2 className="font-medium">João Silva</h2>
            <p className="text-sm text-muted-foreground">+55 11 98765-4321</p>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {dummyMessages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>
      </ScrollArea>

      <footer className="p-4 border-t">
        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
          <Textarea
            placeholder="Digite sua mensagem..."
            className="min-h-[2.5rem] max-h-32"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button type="submit" size="icon" className="h-10 w-10">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}

const dummyMessages = [
  {
    id: "1",
    content: "Olá, gostaria de saber mais sobre os serviços",
    timestamp: "10:30",
    type: "received" as const
  },
  {
    id: "2",
    content: "Olá! Claro, como posso ajudar?",
    timestamp: "10:31",
    type: "sent" as const
  },
  // Mais mensagens para demonstração
];
