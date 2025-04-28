import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MessageCircle, Clock, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutomationItem {
  id: string;
  name: string;
  active: boolean;
  triggers: string[];
  responses: string;
  icon: React.ReactNode;
}

export function AutomationSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [automations, setAutomations] = useState<AutomationItem[]>([
    {
      id: "1",
      name: "Mensagem de Boas-vindas",
      active: true,
      triggers: ["olá", "oi", "bom dia", "boa tarde", "boa noite"],
      responses: "Olá! Bem-vindo ao nosso atendimento. Como posso ajudar você hoje?",
      icon: <MessageCircle className="h-5 w-5" />
    },
    {
      id: "2",
      name: "Horário de Funcionamento",
      active: true,
      triggers: ["horário", "funciona", "aberto", "atendimento"],
      responses: "Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.",
      icon: <Clock className="h-5 w-5" />
    },
    {
      id: "3",
      name: "Menu Principal",
      active: true,
      triggers: ["menu", "opções", "ajuda"],
      responses: "Digite uma opção:\n1 - Informações\n2 - Produtos\n3 - Suporte\n4 - Falar com um atendente",
      icon: <Settings className="h-5 w-5" />
    }
  ]);
  
  const [editingAutomation, setEditingAutomation] = useState<AutomationItem | null>(null);
  
  const handleToggleActive = (id: string) => {
    setAutomations(automations.map(item => 
      item.id === id ? { ...item, active: !item.active } : item
    ));
    
    toast({
      title: "Status atualizado",
      description: `A automação foi ${automations.find(a => a.id === id)?.active ? "desativada" : "ativada"}.`,
    });
  };
  
  const handleEditAutomation = (automation: AutomationItem) => {
    setEditingAutomation(automation);
  };
  
  const handleSaveAutomation = () => {
    if (!editingAutomation) return;
    
    setLoading(true);
    
    setTimeout(() => {
      setAutomations(automations.map(item => 
        item.id === editingAutomation.id ? editingAutomation : item
      ));
      setEditingAutomation(null);
      setLoading(false);
      
      toast({
        title: "Automação atualizada",
        description: "As configurações da automação foram salvas com sucesso.",
      });
    }, 1000);
  };
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Automações Configuradas</CardTitle>
          <CardDescription>
            Gerencie respostas automáticas e fluxos de mensagens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <div className="grid gap-4">
            {automations.map((automation) => (
              <div 
                key={automation.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${automation.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {automation.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{automation.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {automation.triggers.slice(0, 3).join(", ")}{automation.triggers.length > 3 ? "..." : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <Switch 
                    checked={automation.active} 
                    onCheckedChange={() => handleToggleActive(automation.id)}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditAutomation(automation)}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full sm:w-auto">
            Adicionar Nova Automação
          </Button>
        </CardFooter>
      </Card>
      
      {editingAutomation && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Automação</CardTitle>
            <CardDescription>
              Configure os detalhes da automação selecionada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={editingAutomation.name}
                onChange={(e) => setEditingAutomation({...editingAutomation, name: e.target.value})}
                className="max-w-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="triggers">Palavras-chave (separadas por vírgula)</Label>
              <Input
                id="triggers"
                value={editingAutomation.triggers.join(", ")}
                onChange={(e) => setEditingAutomation({
                  ...editingAutomation, 
                  triggers: e.target.value.split(",").map(item => item.trim())
                })}
                className="max-w-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="response">Resposta Automática</Label>
              <Textarea
                id="response"
                rows={5}
                value={editingAutomation.responses}
                onChange={(e) => setEditingAutomation({...editingAutomation, responses: e.target.value})}
                className="max-w-xl resize-y min-h-[100px]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                id="active"
                checked={editingAutomation.active}
                onCheckedChange={(checked) => setEditingAutomation({...editingAutomation, active: checked})}
              />
              <Label htmlFor="active">Automação ativa</Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button variant="outline" onClick={() => setEditingAutomation(null)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSaveAutomation} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
