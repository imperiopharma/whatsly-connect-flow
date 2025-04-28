
import { QrCode, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";

export function WhatsAppConnection() {
  const { status, qrCode, number, error, connect, disconnect } = useWhatsAppConnection();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Conexão WhatsApp</CardTitle>
        <CardDescription>
          Conecte seu número do WhatsApp para começar a usar
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center gap-4">
          {status === 'connected' ? (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto">
                <Phone className="w-8 h-8" />
              </div>
              <p className="font-medium">Conectado</p>
              {number && <p className="text-sm text-muted-foreground">{number}</p>}
            </div>
          ) : status === 'connecting' ? (
            <div className="text-center space-y-4">
              {qrCode ? (
                <div className="qr-code-container p-4 bg-white rounded-lg border-2 border-dashed">
                  <img 
                    src={`data:image/png;base64,${qrCode}`} 
                    alt="WhatsApp QR Code" 
                    className="w-48 h-48"
                  />
                </div>
              ) : (
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              )}
              <p className="text-sm text-muted-foreground">
                {qrCode ? 'Escaneie o QR Code com seu WhatsApp' : 'Gerando QR Code...'}
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto">
                <QrCode className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Clique em conectar para começar
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        {status === 'connected' ? (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={disconnect}
          >
            Desconectar
          </Button>
        ) : status === 'connecting' ? (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={disconnect}
          >
            Cancelar
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={connect}
          >
            Conectar WhatsApp
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
