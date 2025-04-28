
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MessageCircle, Timer, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Automation {
  id: string;
  name: string;
  triggers: string[];
  response: string;
  active: boolean;
  icon: "message" | "timer" | "settings";
}

const automations: Automation[] = [
  {
    id: "1",
    name: "Mensagem de Boas-vindas",
    triggers: ["olá", "oi", "bom dia"],
    response: "Olá! Bem-vindo ao nosso atendimento. Como posso ajudar?",
    active: true,
    icon: "message"
  },
  {
    id: "2",
    name: "Horário de Funcionamento",
    triggers: ["horário", "funcionamento", "atendimento"],
    response: "Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.",
    active: true,
    icon: "timer"
  },
];

export function AutomationList() {
  const { toast } = useToast();

  const getIcon = (type: Automation["icon"]) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-5 w-5" />;
      case "timer":
        return <Timer className="h-5 w-5" />;
      case "settings":
        return <Settings className="h-5 w-5" />;
    }
  };

  const handleToggleActive = (automation: Automation) => {
    toast({
      title: automation.active ? "Automação desativada" : "Automação ativada",
      description: `A automação "${automation.name}" foi ${automation.active ? "desativada" : "ativada"}.`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automações Configuradas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {automations.map((automation) => (
          <div
            key={automation.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${automation.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {getIcon(automation.icon)}
              </div>
              <div>
                <h3 className="font-medium">{automation.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {automation.triggers.slice(0, 3).join(", ")}
                  {automation.triggers.length > 3 ? "..." : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={automation.active}
                onCheckedChange={() => handleToggleActive(automation)}
              />
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
