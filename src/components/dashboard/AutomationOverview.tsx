
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface AutomationStats {
  name: string;
  active: boolean;
  triggers: number;
  icon: React.ReactNode;
}

const automations: AutomationStats[] = [
  {
    name: "Menu Principal",
    active: true,
    triggers: 124,
    icon: <MessageCircle className="h-5 w-5" />
  },
  {
    name: "Atendimento Inicial",
    active: true,
    triggers: 87,
    icon: <CheckCircle2 className="h-5 w-5" />
  },
  {
    name: "Horário Comercial",
    active: false,
    triggers: 0,
    icon: <Clock className="h-5 w-5" />
  },
  {
    name: "FAQ Automático",
    active: true,
    triggers: 53,
    icon: <AlertCircle className="h-5 w-5" />
  }
];

export function AutomationOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Automações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {automations.map((automation) => (
          <div key={automation.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${automation.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {automation.icon}
              </div>
              <div>
                <p className="font-medium">{automation.name}</p>
                <p className="text-xs text-muted-foreground">
                  {automation.active 
                    ? `${automation.triggers} acionamentos` 
                    : "Desativado"}
                </p>
              </div>
            </div>
            <div>
              <div className={`w-3 h-3 rounded-full ${automation.active ? 'bg-whatsapp' : 'bg-muted'}`}></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
