
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

export function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  
  const handleConnect = () => {
    setStatus('connecting');
    // Simulação da conexão - em um cenário real, aqui seria o processo de geração do QR code
    setTimeout(() => setStatus('connected'), 3000);
  };
  
  const handleDisconnect = () => {
    setStatus('disconnected');
  };
  
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Status de Conexão</span>
          <div className="flex items-center text-sm">
            {status === 'connected' ? (
              <>
                <span className="w-2 h-2 bg-whatsapp rounded-full animate-pulse mr-2"></span>
                <span>Conectado</span>
              </>
            ) : status === 'connecting' ? (
              <>
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></span>
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                <span>Desconectado</span>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="text-center md:text-left md:flex-1">
            <h3 className="text-lg font-medium mb-2">WhatsApp</h3>
            {status === 'connected' ? (
              <div className="space-y-4">
                <p>Você está conectado com o número:</p>
                <p className="text-xl font-bold">+55 (11) 98765-4321</p>
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
                  <span className="font-medium">2 horas</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Bateria:</span>
                  <span className="font-medium">85%</span>
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
  );
}
