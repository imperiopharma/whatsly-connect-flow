
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface WhatsAppState {
  status: ConnectionStatus;
  qrCode: string | null;
  number: string | null;
  error: string | null;
}

export function useWhatsAppConnection() {
  const [state, setState] = useState<WhatsAppState>({
    status: 'disconnected',
    qrCode: null,
    number: null,
    error: null
  });
  const { toast } = useToast();

  const connect = async () => {
    try {
      setState(prev => ({ ...prev, status: 'connecting', error: null }));
      
      // Aqui você fará a chamada para seu backend na VPS
      const response = await fetch('https://seu-backend-vps/whatsapp/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.qrCode) {
        setState(prev => ({ ...prev, qrCode: data.qrCode }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        status: 'disconnected',
        error: 'Falha ao conectar com o servidor'
      }));
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor WhatsApp",
        variant: "destructive"
      });
    }
  };

  const disconnect = async () => {
    try {
      await fetch('https://seu-backend-vps/whatsapp/disconnect', {
        method: 'POST',
      });
      setState({
        status: 'disconnected',
        qrCode: null,
        number: null,
        error: null
      });
      toast({
        title: "Desconectado",
        description: "WhatsApp desconectado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao desconectar",
        variant: "destructive"
      });
    }
  };

  return {
    ...state,
    connect,
    disconnect,
  };
}
