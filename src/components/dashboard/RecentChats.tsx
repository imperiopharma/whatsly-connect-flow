
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base sm:text-lg">Conversas Recentes</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs">
          Ver todas
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px] sm:h-[320px]">
          <div className="divide-y">
            {dummyContacts.map((contact) => (
              <div 
                key={contact.phone} 
                className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-whatsly-100 flex items-center justify-center">
                    <span className="text-whatsly-800 text-sm sm:text-base">{contact.avatar}</span>
                  </div>
                  {contact.unread && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-whatsapp text-white text-xs flex items-center justify-center rounded-full">
                      {contact.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate text-sm sm:text-base">{contact.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{contact.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {contact.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
