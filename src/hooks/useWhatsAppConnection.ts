
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { api } from '@/services/api';
import { API_CONFIG } from '@/config/api';

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

  // Verifica o status da conexão ao montar o componente
  useEffect(() => {
    checkConnectionStatus();
    
    // Configura polling para verificar o status a cada 30 segundos
    const intervalId = setInterval(checkConnectionStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Função para verificar o status atual da conexão com o WhatsApp
  const checkConnectionStatus = useCallback(async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.WHATSAPP.STATUS);
      
      if (response.connected) {
        setState(prev => ({ 
          ...prev, 
          status: 'connected',
          number: response.number || null,
          qrCode: null
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          status: 'disconnected',
          number: null
        }));
      }
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error);
      // Não exibimos toast aqui para não incomodar o usuário
    }
  }, []);

  // Função para iniciar o processo de conexão
  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: 'connecting', error: null }));
      
      // Solicita o início da conexão ao servidor
      const response = await api.post(API_CONFIG.ENDPOINTS.WHATSAPP.CONNECT);
      
      // Se o servidor já estiver conectado, atualiza o estado
      if (response.connected) {
        setState(prev => ({ 
          ...prev, 
          status: 'connected',
          number: response.number,
          qrCode: null 
        }));
        
        toast({
          title: "WhatsApp conectado",
          description: `Conectado com o número ${response.number}`,
        });
        return;
      }
      
      // Se o servidor retornar um QR code, atualiza o estado
      if (response.qrCode) {
        setState(prev => ({ ...prev, qrCode: response.qrCode }));
        
        // Inicia o polling de verificação do status para detectar quando o QR for escaneado
        const checkQrInterval = setInterval(async () => {
          const statusResponse = await api.get(API_CONFIG.ENDPOINTS.WHATSAPP.STATUS);
          
          if (statusResponse.connected) {
            clearInterval(checkQrInterval);
            setState(prev => ({ 
              ...prev, 
              status: 'connected',
              number: statusResponse.number,
              qrCode: null 
            }));
            
            toast({
              title: "WhatsApp conectado",
              description: `Conectado com o número ${statusResponse.number}`,
            });
          }
        }, 3000);
        
        // Limpa o intervalo após 2 minutos (tempo limite para escanear o QR)
        setTimeout(() => {
          clearInterval(checkQrInterval);
          if (state.status !== 'connected') {
            setState(prev => ({ 
              ...prev, 
              status: 'disconnected',
              error: 'Tempo limite excedido para escanear o QR code',
              qrCode: null 
            }));
            
            toast({
              title: "Tempo excedido",
              description: "O QR code expirou. Tente novamente.",
              variant: "destructive"
            });
          }
        }, 120000);
      }
    } catch (error) {
      console.error('Erro ao conectar com o WhatsApp:', error);
      setState(prev => ({ 
        ...prev, 
        status: 'disconnected',
        error: 'Falha ao conectar com o servidor WhatsApp',
        qrCode: null
      }));
      
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor WhatsApp",
        variant: "destructive"
      });
    }
  }, [toast, state.status]);

  // Função para desconectar o WhatsApp
  const disconnect = useCallback(async () => {
    try {
      await api.post(API_CONFIG.ENDPOINTS.WHATSAPP.DISCONNECT);
      
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
      console.error('Erro ao desconectar:', error);
      toast({
        title: "Erro",
        description: "Falha ao desconectar do WhatsApp",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    ...state,
    connect,
    disconnect,
  };
}
