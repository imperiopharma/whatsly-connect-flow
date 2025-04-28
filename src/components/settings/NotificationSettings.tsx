
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bell, Volume2, Vibrate } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopAlerts, setDesktopAlerts] = useState(true);
  const [notificationVolume, setNotificationVolume] = useState("medium");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  
  const handleSave = () => {
    setLoading(true);
    
    // Simulação de salvamento (em produção, seria uma chamada à API)
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Configurações de notificação salvas",
        description: "Suas configurações de notificação foram atualizadas com sucesso.",
      });
    }, 1000);
  };
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Notificação</CardTitle>
          <CardDescription>
            Personalize como você deseja ser notificado sobre novas mensagens e atividades.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="push-notifications">Notificações Push</Label>
            </div>
            <Switch
              id="push-notifications"
              checked={pushEnabled}
              onCheckedChange={setPushEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="sound-notifications">Sons de Notificação</Label>
            </div>
            <Switch
              id="sound-notifications"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vibrate className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="desktop-alerts">Alertas na Área de Trabalho</Label>
            </div>
            <Switch
              id="desktop-alerts"
              checked={desktopAlerts}
              onCheckedChange={setDesktopAlerts}
            />
          </div>
          
          {soundEnabled && (
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Volume das Notificações</Label>
              <RadioGroup 
                value={notificationVolume} 
                onValueChange={setNotificationVolume}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Baixo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Médio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">Alto</Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Alerta</CardTitle>
          <CardDescription>
            Configure quais eventos devem gerar notificações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="new-message">Nova mensagem</Label>
            <Switch
              id="new-message"
              defaultChecked={true}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="mention">Menção direta</Label>
            <Switch
              id="mention"
              defaultChecked={true}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="connection-status">Status de conexão</Label>
            <Switch
              id="connection-status"
              defaultChecked={true}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="system-updates">Atualizações do sistema</Label>
            <Switch
              id="system-updates"
              defaultChecked={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
