
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    // Carrega contatos do localStorage na inicialização
    const savedContacts = localStorage.getItem('contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
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
      setContacts(initialContacts);
      localStorage.setItem('contacts', JSON.stringify(initialContacts));
    }
  }, []);

  const addContact = (contact: Omit<Contact, "id">) => {
    const newContact = {
      ...contact,
      id: crypto.randomUUID()
    };
    const updatedContacts = [...contacts, newContact];
    setContacts(updatedContacts);
    localStorage.setItem('contacts', JSON.stringify(updatedContacts));
    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    const updatedContacts = contacts.map(contact => 
      contact.id === id ? { ...contact, ...updates } : contact
    );
    setContacts(updatedContacts);
    localStorage.setItem('contacts', JSON.stringify(updatedContacts));
  };

  const deleteContact = (id: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    setContacts(updatedContacts);
    localStorage.setItem('contacts', JSON.stringify(updatedContacts));
  };

  return {
    contacts,
    addContact,
    updateContact,
    deleteContact
  };
}
