
import { useState, useEffect } from 'react';
import { db } from '../services/db';

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  type: "sent" | "received";
  chatId: string;
}

export interface Chat {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  status: "active" | "ended";
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar conversas
  useEffect(() => {
    const loadChats = async () => {
      try {
        const savedChats = await db.getAll('chats');
        
        if (savedChats.length > 0) {
          setChats(savedChats);
          if (!activeChat && savedChats.length > 0) {
            setActiveChat(savedChats[0].id);
          }
        } else {
          // Dados iniciais de exemplo
          const initialChats: Chat[] = [
            {
              id: "1",
              name: "João Silva",
              phone: "+55 11 98765-4321",
              lastMessage: "Olá, gostaria de saber mais sobre os serviços",
              timestamp: "10:30",
              unread: 2,
              status: "active"
            },
            {
              id: "2",
              name: "Maria Oliveira",
              phone: "+55 11 91234-5678",
              lastMessage: "Obrigado pelo atendimento!",
              timestamp: "09:45",
              unread: 0,
              status: "ended"
            },
            {
              id: "3",
              name: "Carlos Mendes",
              phone: "+55 11 99876-5432",
              lastMessage: "Qual o prazo de entrega?",
              timestamp: "Ontem",
              unread: 1,
              status: "active"
            }
          ];
          
          // Adiciona cada conversa inicial ao banco
          for (const chat of initialChats) {
            await db.add('chats', chat);
          }
          
          setChats(initialChats);
          
          if (!activeChat) {
            setActiveChat(initialChats[0].id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar conversas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [activeChat]);

  // Carregar mensagens do chat ativo
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat) return;

      try {
        const chatMessages = await db.getAllFrom('messages', 'chatId', activeChat);
        
        if (chatMessages.length > 0) {
          setMessages(chatMessages);
        } else {
          // Mensagens iniciais de exemplo para este chat
          const initialMessages: ChatMessage[] = [
            {
              id: "1",
              content: "Olá, gostaria de saber mais sobre os serviços",
              timestamp: "10:30",
              type: "received",
              chatId: activeChat
            },
            {
              id: "2",
              content: "Olá! Claro, como posso ajudar?",
              timestamp: "10:31",
              type: "sent",
              chatId: activeChat
            },
            {
              id: "3",
              content: "Vocês têm pacote para pequenas empresas?",
              timestamp: "10:32",
              type: "received",
              chatId: activeChat
            }
          ];
          
          // Adiciona cada mensagem inicial ao banco
          for (const message of initialMessages) {
            await db.add('messages', message);
          }
          
          setMessages(initialMessages);
        }

        // Marcar mensagens como lidas
        if (activeChat) {
          const chat = chats.find(c => c.id === activeChat);
          if (chat && chat.unread > 0) {
            const updatedChat = { ...chat, unread: 0 };
            await db.update('chats', updatedChat);
            setChats(prev => prev.map(c => c.id === activeChat ? updatedChat : c));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
    };

    loadMessages();
  }, [activeChat, chats]);

  // Enviar nova mensagem
  const sendMessage = async (content: string) => {
    if (!activeChat || !content.trim()) return;
    
    const now = new Date();
    const timestamp = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');
    
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content,
      timestamp,
      type: "sent",
      chatId: activeChat
    };
    
    try {
      await db.add('messages', newMessage);
      
      // Atualiza a lista de mensagens
      setMessages(prev => [...prev, newMessage]);
      
      // Atualiza a última mensagem e hora no chat
      const updatedChat = chats.find(c => c.id === activeChat);
      if (updatedChat) {
        const chatUpdate = {
          ...updatedChat,
          lastMessage: content,
          timestamp
        };
        await db.update('chats', chatUpdate);
        setChats(prev => prev.map(c => c.id === activeChat ? chatUpdate : c));
      }

      // Simula uma resposta automática após um breve atraso
      setTimeout(async () => {
        const autoResponses = [
          "Obrigado por sua mensagem! Vamos analisar.",
          "Recebi sua mensagem. Responderemos em breve.",
          "Agradeço o contato! Estamos processando sua solicitação."
        ];
        
        const responseIdx = Math.floor(Math.random() * autoResponses.length);
        const responseTime = new Date();
        const responseTimestamp = responseTime.getHours().toString().padStart(2, '0') + ':' + 
                               responseTime.getMinutes().toString().padStart(2, '0');
        
        const autoResponse: ChatMessage = {
          id: crypto.randomUUID(),
          content: autoResponses[responseIdx],
          timestamp: responseTimestamp,
          type: "received",
          chatId: activeChat
        };
        
        await db.add('messages', autoResponse);
        setMessages(prev => [...prev, autoResponse]);
        
        // Atualiza o chat com a mensagem de resposta
        if (updatedChat) {
          const chatWithResponse = {
            ...updatedChat,
            lastMessage: autoResponses[responseIdx],
            timestamp: responseTimestamp
          };
          await db.update('chats', chatWithResponse);
          setChats(prev => prev.map(c => c.id === activeChat ? chatWithResponse : c));
        }
      }, 1500);
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  };

  return {
    chats,
    messages,
    activeChat,
    setActiveChat,
    sendMessage,
    loading
  };
}
