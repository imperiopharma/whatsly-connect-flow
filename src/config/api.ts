
// Configuração da API - Altere o URL_BASE para apontar para seu backend na VPS
export const API_CONFIG = {
  // URL_BASE: 'http://localhost:3000/api',  // Ambiente de desenvolvimento 
  URL_BASE: 'https://seu-backend-vps.com/api', // Altere para a URL da sua VPS
  ENDPOINTS: {
    // Endpoints do WhatsApp
    WHATSAPP: {
      CONNECT: '/whatsapp/connect',
      DISCONNECT: '/whatsapp/disconnect',
      STATUS: '/whatsapp/status',
      QR_CODE: '/whatsapp/qrcode'
    },
    // Endpoints de contatos
    CONTACTS: {
      LIST: '/contacts',
      CREATE: '/contacts',
      UPDATE: '/contacts', // Adicione /:id ao usar
      DELETE: '/contacts', // Adicione /:id ao usar
      SYNC: '/contacts/sync'
    },
    // Endpoints de chat
    CHATS: {
      LIST: '/chats',
      MESSAGES: '/chats', // Adicione /:id/messages ao usar
      SEND: '/chats', // Adicione /:id/messages ao usar
    }
  },
  TIMEOUT: 30000, // 30 segundos
};
