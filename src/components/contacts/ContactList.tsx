
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, UserPlus, Tag } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastContact: string;
  tags: string[];
  status: "active" | "inactive";
}

const contacts: Contact[] = [
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

export function ContactList() {
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
              <Button variant="outline" size="sm">
                Ver Detalhes
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
