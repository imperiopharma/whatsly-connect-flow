
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export function GeneralSettings() {
  const [businessName, setBusinessName] = useState("Meu Negócio");
  const [timeZone, setTimeZone] = useState("America/Sao_Paulo");
  const [operatingHours, setOperatingHours] = useState("9:00 - 18:00");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  
  const handleSave = () => {
    setLoading(true);
    
    // Simulação de salvamento (em produção, seria uma chamada à API)
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    }, 1000);
  };
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Negócio</CardTitle>
          <CardDescription>
            Defina as informações básicas do seu negócio para personalizar sua experiência.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome do Negócio</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeZone">Fuso Horário</Label>
            <Input
              id="timeZone" 
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="operatingHours">Horário de Funcionamento</Label>
            <Input
              id="operatingHours"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Preferências da Interface</CardTitle>
          <CardDescription>
            Personalize a aparência e o comportamento da sua interface.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="darkMode">Modo Escuro</Label>
            <Switch
              id="darkMode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
