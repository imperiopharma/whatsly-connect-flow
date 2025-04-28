
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const savedContacts = await db.getAll('contacts');
        if (savedContacts.length > 0) {
          setContacts(savedContacts);
        } else {
          // Dados iniciais de exemplo
          const initialContacts: Contact[] = [
            {
              id: "1",
              name: "João Silva",
              phone: "+55 11 98765-4321",
              lastContact: "2024-04-28",
              tags: ["cliente", "vip"],
              status: "active"
            },
            {
              id: "2",
              name: "Maria Oliveira",
              phone: "+55 11 91234-5678",
              lastContact: "2024-04-27",
              tags: ["lead"],
              status: "active"
            }
          ];
          
          // Adiciona cada contato inicial ao banco
          for (const contact of initialContacts) {
            await db.add('contacts', contact);
          }
          
          setContacts(initialContacts);
        }
      } catch (error) {
        console.error('Erro ao carregar contatos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  const addContact = async (contact: Omit<Contact, "id">) => {
    const newContact = {
      ...contact,
      id: crypto.randomUUID()
    };
    
    try {
      await db.add('contacts', newContact);
      setContacts(prev => [...prev, newContact]);
      return newContact;
    } catch (error) {
      console.error('Erro ao adicionar contato:', error);
      throw error;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const contact = contacts.find(c => c.id === id);
      if (!contact) throw new Error('Contato não encontrado');

      const updatedContact = { ...contact, ...updates };
      await db.update('contacts', updatedContact);
      
      setContacts(prev => prev.map(c => 
        c.id === id ? updatedContact : c
      ));
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await db.delete('contacts', id);
      setContacts(prev => prev.filter(contact => contact.id !== id));
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
      throw error;
    }
  };

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact
  };
}
