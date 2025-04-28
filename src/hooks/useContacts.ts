
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { api } from '@/services/api';
import { API_CONFIG } from '@/config/api';
import { db } from '../services/db';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  lastContact: string;
  tags: string[];
  status: "active" | "inactive";
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingContacts, setSyncingContacts] = useState(false);
  const { toast } = useToast();

  // Carrega contatos ao montar o componente
  useEffect(() => {
    loadContacts();
  }, []);

  // Função para carregar contatos
  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      // Primeiro tenta carregar do banco de dados local
      const localContacts = await db.getAll('contacts');
      
      if (localContacts.length > 0) {
        setContacts(localContacts);
      }
      
      // Depois tenta carregar do servidor (se estiver online)
      try {
        const serverContacts = await api.get(API_CONFIG.ENDPOINTS.CONTACTS.LIST);
        
        if (serverContacts && serverContacts.length > 0) {
          // Atualiza o banco local com os contatos do servidor
          for (const contact of serverContacts) {
            await db.update('contacts', contact);
          }
          
          setContacts(serverContacts);
        }
      } catch (error) {
        console.log('Usando contatos do cache local. Erro ao buscar do servidor:', error);
        // Não exibe toast aqui pois já estamos usando os contatos locais
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contatos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Função para sincronizar contatos do WhatsApp
  const syncContacts = useCallback(async () => {
    setSyncingContacts(true);
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.CONTACTS.SYNC);
      
      if (response.success) {
        // Recarrega a lista de contatos após sincronização
        await loadContacts();
        
        toast({
          title: "Sucesso",
          description: `${response.count || 'Contatos'} sincronizados com sucesso.`
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar contatos:', error);
      toast({
        title: "Erro",
        description: "Falha ao sincronizar contatos do WhatsApp",
        variant: "destructive"
      });
    } finally {
      setSyncingContacts(false);
    }
  }, [loadContacts, toast]);

  // Função para adicionar um contato
  const addContact = useCallback(async (contact: Omit<Contact, "id">) => {
    try {
      // Envia o contato para o servidor
      const newContact = await api.post(API_CONFIG.ENDPOINTS.CONTACTS.CREATE, contact);
      
      // Salva no banco local
      await db.add('contacts', newContact);
      
      // Atualiza o estado
      setContacts(prev => [...prev, newContact]);
      
      toast({
        title: "Contato adicionado",
        description: "O contato foi adicionado com sucesso."
      });
      
      return newContact;
    } catch (error) {
      console.error('Erro ao adicionar contato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o contato",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Função para atualizar um contato
  const updateContact = useCallback(async (id: string, updates: Partial<Contact>) => {
    try {
      // Envia a atualização para o servidor
      const updatedContact = await api.put(`${API_CONFIG.ENDPOINTS.CONTACTS.UPDATE}/${id}`, updates);
      
      // Atualiza no banco local
      await db.update('contacts', updatedContact);
      
      // Atualiza o estado
      setContacts(prev => prev.map(c => 
        c.id === id ? updatedContact : c
      ));
      
      toast({
        title: "Contato atualizado",
        description: "O contato foi atualizado com sucesso."
      });
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o contato",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Função para excluir um contato
  const deleteContact = useCallback(async (id: string) => {
    try {
      // Envia a solicitação de exclusão para o servidor
      await api.delete(`${API_CONFIG.ENDPOINTS.CONTACTS.DELETE}/${id}`);
      
      // Remove do banco local
      await db.delete('contacts', id);
      
      // Atualiza o estado
      setContacts(prev => prev.filter(contact => contact.id !== id));
      
      toast({
        title: "Contato excluído",
        description: "O contato foi removido com sucesso."
      });
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o contato",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  return {
    contacts,
    loading,
    syncingContacts,
    loadContacts,
    syncContacts,
    addContact,
    updateContact,
    deleteContact
  };
}
