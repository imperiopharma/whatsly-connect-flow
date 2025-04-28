
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { useChats } from "@/hooks/useChats";

export function ChatWindow() {
  const { activeChat, messages, chats, sendMessage } = useChats();
  const [message, setMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Rola para o final da conversa quando novas mensagens são adicionadas
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [messages]);
  
  const currentChat = chats.find(chat => chat.id === activeChat);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !activeChat) return;
    
    const success = await sendMessage(message);
    
    if (success) {
      setMessage("");
      
      // Foca no textarea após enviar
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };
  
  // Ajusta a altura do textarea conforme o conteúdo
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Reset altura
    e.target.style.height = 'auto';
    
    // Ajusta altura baseado no conteúdo
    const newHeight = Math.min(e.target.scrollHeight, 120); // Máximo de 120px
    e.target.style.height = `${newHeight}px`;
  };
  
  // Permite enviar com Enter (mas shift+enter para nova linha)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!activeChat) {
    return (
      <div className="flex-1 border rounded-lg bg-card flex items-center justify-center">
        <div className="text-center p-6">
          <h3 className="font-medium text-lg mb-2">Nenhuma conversa selecionada</h3>
          <p className="text-muted-foreground">Selecione uma conversa para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 border rounded-lg bg-card flex flex-col">
      <header className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">
              {currentChat?.name.split(" ").map(n => n[0]).join("") || "?"}
            </span>
          </div>
          <div>
            <h2 className="font-medium">{currentChat?.name}</h2>
            <p className="text-sm text-muted-foreground">{currentChat?.phone}</p>
          </div>
        </div>
      </header>

      <ScrollArea 
        className="flex-1 p-4" 
        ref={scrollAreaRef}
      >
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <ChatMessageComponent key={msg.id} message={msg} />
            ))
          ) : (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <footer className="p-4 border-t">
        <form className="flex gap-2" onSubmit={handleSendMessage}>
          <Textarea
            ref={textareaRef}
            placeholder="Digite sua mensagem..."
            className="min-h-[2.5rem] max-h-32 resize-none"
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-10 w-10"
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
