
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Contact {
  name: string;
  phone: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
}

const dummyContacts: Contact[] = [
  {
    name: "Maria Silva",
    phone: "+55 11 98765-4321",
    avatar: "MS",
    lastMessage: "Olá, gostaria de informações sobre...",
    time: "10:45",
    unread: 3
  },
  {
    name: "João Pereira",
    phone: "+55 11 91234-5678",
    avatar: "JP",
    lastMessage: "Obrigado pelo atendimento!",
    time: "09:30"
  },
  {
    name: "Ana Oliveira",
    phone: "+55 11 99876-5432",
    avatar: "AO",
    lastMessage: "Qual o horário de funcionamento?",
    time: "Ontem",
    unread: 1
  }
];

export function RecentChats() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Conversas Recentes</CardTitle>
        <Button variant="ghost" className="text-xs">Ver todas</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {dummyContacts.map((contact) => (
            <div 
              key={contact.phone} 
              className="whatsly-conversation-item"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-whatsly-100 flex items-center justify-center">
                  <span className="text-whatsly-800">{contact.avatar}</span>
                </div>
                {contact.unread && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-whatsapp text-white text-xs flex items-center justify-center rounded-full">
                    {contact.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="font-medium truncate">{contact.name}</span>
                  <span className="text-xs text-muted-foreground">{contact.time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
