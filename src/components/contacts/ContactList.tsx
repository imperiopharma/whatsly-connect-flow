
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, UserPlus, Tag, Trash2, Edit } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import { useToast } from "@/hooks/use-toast";

export function ContactList() {
  const { contacts, deleteContact } = useContacts();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    deleteContact(id);
    toast({
      title: "Contato excluído",
      description: "O contato foi removido com sucesso."
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contatos</CardTitle>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Contato
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{contact.name}</h3>
                <p className="text-sm text-muted-foreground">{contact.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(contact.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
