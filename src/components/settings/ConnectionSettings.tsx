
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, RefreshCw, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

export function ConnectionSettings() {
  const [status, setStatus] = useState<ConnectionStatus>('connected');
  const [phoneNumber] = useState("+55 (11) 98765-4321");
  const [batteryLevel] = useState(85);
  const [connectedSince] = useState("2 horas");
  const { toast } = useToast();
  
  const handleDisconnect = () => {
    setStatus('disconnected');
    toast({
      title: "Dispositivo desconectado",
      description: "Seu WhatsApp foi desconectado com sucesso.",
    });
  };
  
  const handleConnect = () => {
    setStatus('connecting');
    // Em um cenário real, aqui seria iniciada a conexão com o WhatsApp
    // e o QR code seria exibido, mas simulamos apenas para demonstração
    toast({
      title: "Iniciando conexão",
      description: "Por favor, escaneie o QR Code com seu WhatsApp.",
    });
  };
  
  const handleRefresh = () => {
    toast({
      title: "Atualizando QR Code",
      description: "Um novo QR Code foi gerado.",
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conexão com WhatsApp</CardTitle>
          <CardDescription>
            Gerencie sua conexão com o WhatsApp Business API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="text-center md:text-left md:flex-1">
              <h3 className="text-lg font-medium mb-2">WhatsApp Business API</h3>
              {status === 'connected' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-whatsapp rounded-full animate-pulse"></span>
                    <span>Conectado</span>
                  </div>
                  <p>Você está conectado com o número:</p>
                  <p className="text-xl font-bold">{phoneNumber}</p>
                  <Button 
                    onClick={handleDisconnect} 
                    variant="outline"
                    className="mt-4"
                  >
                    Desconectar
                  </Button>
                </div>
              ) : status === 'connecting' ? (
                <div className="space-y-4">
                  <p>Escaneie o QR Code com seu WhatsApp:</p>
                  <div className="border-2 border-dashed border-border flex items-center justify-center p-6 w-48 h-48 mx-auto md:mx-0">
                    <div className="whatsly-pulse-animation">
                      <QrCode size={120} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Atualizar QR Code
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setStatus('disconnected')}>
                      Cancelar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Abra o WhatsApp no seu celular, vá para Configurações &gt; WhatsApp Web e escaneie o código QR
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>Você precisa conectar um número do WhatsApp para começar a usar a plataforma.</p>
                  <Button 
                    onClick={handleConnect} 
                    className="mt-4"
                  >
                    Conectar WhatsApp
                  </Button>
                </div>
              )}
            </div>
            
            {status === 'connected' && (
              <div className="bg-muted p-4 rounded-lg md:flex-1">
                <h4 className="font-medium mb-2">Detalhes da Conexão</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">Ativo</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Conectado há:</span>
                    <span className="font-medium">{connectedSince}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Bateria:</span>
                    <span className="font-medium">{batteryLevel}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Versão:</span>
                    <span className="font-medium">3.5.2</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Avançadas</CardTitle>
          <CardDescription>
            Personalize as configurações avançadas da sua conexão.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertTitle>Persistência de sessão</AlertTitle>
            <AlertDescription>
              Sua sessão será automaticamente restaurada caso a conexão seja interrompida. Não será necessário escanear o QR Code novamente.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Reconexão Automática</h4>
              <p className="text-sm text-muted-foreground">
                Ativar tentativas automáticas de reconexão em caso de queda
              </p>
            </div>
            <div className="text-right">
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Notificações de Reconexão</h4>
              <p className="text-sm text-muted-foreground">
                Receber notificações quando houver tentativas de reconexão
              </p>
            </div>
            <div className="text-right">
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
