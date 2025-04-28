
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { api } from '@/services/api';
import { API_CONFIG } from '@/config/api';
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
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { toast } = useToast();

  // Carrega conversas
  useEffect(() => {
    loadChats();
  }, []);

  // Carregar mensagens quando o chat ativo mudar
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat);
    }
  }, [activeChat]);

  // Função para carregar conversas
  const loadChats = useCallback(async () => {
    setLoading(true);
    try {
      // Primeiro tenta carregar do banco de dados local
      const localChats = await db.getAll('chats');
      
      if (localChats.length > 0) {
        setChats(localChats);
        if (!activeChat && localChats.length > 0) {
          setActiveChat(localChats[0].id);
        }
      }
      
      // Depois tenta carregar do servidor
      try {
        const serverChats = await api.get(API_CONFIG.ENDPOINTS.CHATS.LIST);
        
        if (serverChats && serverChats.length > 0) {
          // Atualiza o banco local com as conversas do servidor
          for (const chat of serverChats) {
            await db.update('chats', chat);
          }
          
          setChats(serverChats);
          
          if (!activeChat && serverChats.length > 0) {
            setActiveChat(serverChats[0].id);
          }
        }
      } catch (error) {
        console.log('Usando chats do cache local. Erro ao buscar do servidor:', error);
        // Não exibe toast aqui pois já estamos usando os chats locais
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [activeChat, toast]);

  // Função para carregar mensagens de um chat
  const loadMessages = useCallback(async (chatId: string) => {
    setLoadingMessages(true);
    try {
      // Primeiro tenta carregar do banco de dados local
      const localMessages = await db.getAllFrom('messages', 'chatId', chatId);
      
      if (localMessages.length > 0) {
        setMessages(localMessages);
      }
      
      // Depois tenta carregar do servidor
      try {
        const serverMessages = await api.get(`${API_CONFIG.ENDPOINTS.CHATS.MESSAGES}/${chatId}/messages`);
        
        if (serverMessages && serverMessages.length > 0) {
          // Atualiza o banco local com as mensagens do servidor
          for (const message of serverMessages) {
            await db.update('messages', message);
          }
          
          setMessages(serverMessages);
        }
        
        // Marca as mensagens como lidas
        if (chatId) {
          const chat = chats.find(c => c.id === chatId);
          if (chat && chat.unread > 0) {
            const updatedChat = { ...chat, unread: 0 };
            await api.put(`${API_CONFIG.ENDPOINTS.CHATS.LIST}/${chatId}/read`);
            await db.update('chats', updatedChat);
            setChats(prev => prev.map(c => c.id === chatId ? updatedChat : c));
          }
        }
      } catch (error) {
        console.log('Usando mensagens do cache local. Erro ao buscar do servidor:', error);
        // Não exibe toast aqui pois já estamos usando as mensagens locais
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
    } finally {
      setLoadingMessages(false);
    }
  }, [chats, toast]);

  // Enviar nova mensagem
  const sendMessage = useCallback(async (content: string) => {
    if (!activeChat || !content.trim()) return;
    
    try {
      // Envia a mensagem para o servidor
      const newMessage = await api.post(`${API_CONFIG.ENDPOINTS.CHATS.SEND}/${activeChat}/messages`, { content });
      
      // Adiciona ao banco local
      await db.add('messages', newMessage);
      
      // Atualiza a lista de mensagens
      setMessages(prev => [...prev, newMessage]);
      
      // Atualiza a última mensagem e hora no chat
      const updatedChat = chats.find(c => c.id === activeChat);
      if (updatedChat) {
        const chatUpdate = {
          ...updatedChat,
          lastMessage: content,
          timestamp: newMessage.timestamp
        };
        await db.update('chats', chatUpdate);
        setChats(prev => prev.map(c => c.id === activeChat ? chatUpdate : c));
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
      return false;
    }
  }, [activeChat, chats, toast]);

  return {
    chats,
    messages,
    activeChat,
    setActiveChat,
    sendMessage,
    loading,
    loadingMessages,
    loadChats,
    loadMessages
  };
}
