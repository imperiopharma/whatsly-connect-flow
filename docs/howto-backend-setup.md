
# Guia de Configuração do Backend - WhatsApp Integration

Este documento fornece instruções detalhadas para configurar o servidor backend na sua VPS para integração com o WhatsApp.

## Requisitos do Sistema

- VPS com sistema operacional Linux (recomendado Ubuntu 20.04+)
- Node.js 14+ e NPM 6+
- Google Chrome ou Chromium instalado
- Mínimo 2GB de RAM
- Servidor HTTP (Nginx ou Apache) para proxy reverso (opcional, mas recomendado)

## Passo 1: Preparar o Ambiente na VPS

### Instalar Node.js e NPM

```bash
# Atualizar os repositórios
sudo apt update

# Instalar Node.js e NPM
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar a instalação
node -v  # Deve mostrar v16.x.x
npm -v   # Deve mostrar 6.x.x ou superior
```

### Instalar o Chromium (necessário para o whatsapp-web.js)

```bash
sudo apt install -y chromium-browser
```

## Passo 2: Configurar o Projeto Backend

### Clonar o Repositório (ou criar manualmente)

```bash
# Criar diretório para o projeto
mkdir -p ~/whatsapp-backend
cd ~/whatsapp-backend

# Iniciar um novo projeto Node.js
npm init -y
```

### Instalar Dependências

```bash
npm install express cors dotenv whatsapp-web.js express-validator helmet morgan
npm install nodemon --save-dev
```

### Estrutura de Arquivos Recomendada

```
whatsapp-backend/
├── .env                   # Variáveis de ambiente
├── server.js              # Ponto de entrada principal
├── package.json           # Dependências e scripts
├── src/
│   ├── config/            # Configurações
│   │   └── whatsapp.js    # Configuração do WhatsApp
│   ├── controllers/       # Controladores para rotas
│   │   ├── whatsapp.js    # Controlador WhatsApp
│   │   ├── contacts.js    # Controlador de contatos
│   │   └── chats.js       # Controlador de chats
│   ├── routes/            # Rotas da API
│   │   ├── whatsapp.js    # Rotas do WhatsApp
│   │   ├── contacts.js    # Rotas de contatos
│   │   └── chats.js       # Rotas de mensagens
│   ├── models/            # Modelos de dados
│   ├── middleware/        # Middleware personalizado
│   └── utils/             # Utilitários
└── sessions/              # Diretório para sessões do WhatsApp
```

## Passo 3: Implementar o Servidor

### Configurar o arquivo `.env`

Crie um arquivo `.env` na raiz do projeto:

```
# Configurações do servidor
PORT=3000
NODE_ENV=production

# Configurações de segurança
CORS_ORIGIN=https://url-do-seu-frontend-lovable.app

# Configurações do WhatsApp
WHATSAPP_SESSION_PATH=./sessions
```

### Criar o arquivo `server.js`

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Importar rotas
const whatsappRoutes = require('./src/routes/whatsapp');
const contactsRoutes = require('./src/routes/contacts');
const chatsRoutes = require('./src/routes/chats');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Rotas
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/chats', chatsRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Gerenciamento de erros não tratados
process.on('uncaughtException', (error) => {
  console.error('Erro não tratado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promessa rejeitada não tratada:', reason);
});
```

## Passo 4: Implementar a Integração com WhatsApp

### Criar a Configuração do WhatsApp (`src/config/whatsapp.js`)

```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

// Configuração do cliente WhatsApp
const createWhatsAppClient = () => {
  return new Client({
    authStrategy: new LocalAuth({
      dataPath: path.resolve(process.env.WHATSAPP_SESSION_PATH || './sessions')
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });
};

module.exports = { createWhatsAppClient };
```

### Implementar Controlador WhatsApp (`src/controllers/whatsapp.js`)

```javascript
const { createWhatsAppClient } = require('../config/whatsapp');

let whatsappClient = null;
let qrCode = null;
let connectionStatus = 'disconnected'; // 'disconnected', 'connecting', 'connected'
let connectedNumber = null;

// Inicializar o cliente WhatsApp
const initializeWhatsApp = () => {
  if (!whatsappClient) {
    whatsappClient = createWhatsAppClient();
    
    whatsappClient.on('qr', (qr) => {
      qrCode = qr;
      connectionStatus = 'connecting';
      console.log('QR Code gerado:', qr);
    });
    
    whatsappClient.on('ready', () => {
      connectionStatus = 'connected';
      whatsappClient.getState().then(state => console.log('Estado da conexão:', state));
      
      // Obter o número conectado
      whatsappClient.getInfo().then(info => {
        connectedNumber = info.wid.user;
        console.log('Número conectado:', connectedNumber);
      });
      
      console.log('Cliente WhatsApp pronto!');
    });
    
    whatsappClient.on('disconnected', (reason) => {
      connectionStatus = 'disconnected';
      connectedNumber = null;
      console.log('Cliente WhatsApp desconectado:', reason);
      
      // Reiniciar o cliente após desconexão
      whatsappClient = null;
      qrCode = null;
    });
    
    whatsappClient.initialize().catch(err => {
      console.error('Erro ao inicializar o cliente WhatsApp:', err);
      connectionStatus = 'disconnected';
      whatsappClient = null;
    });
  }
};

// Controlador para iniciar a conexão
const connect = async (req, res) => {
  try {
    // Se já estiver conectado, retorna o status atual
    if (connectionStatus === 'connected') {
      return res.status(200).json({
        connected: true,
        number: connectedNumber
      });
    }
    
    // Se estiver em processo de conexão e temos um QR code, retorna o QR
    if (connectionStatus === 'connecting' && qrCode) {
      return res.status(200).json({
        connected: false,
        qrCode: qrCode
      });
    }
    
    // Caso contrário, inicia uma nova conexão
    initializeWhatsApp();
    
    // Espera um pouco para dar tempo de gerar o QR code
    setTimeout(() => {
      res.status(200).json({
        connected: connectionStatus === 'connected',
        qrCode: qrCode,
        number: connectedNumber
      });
    }, 2000);
  } catch (error) {
    console.error('Erro ao conectar WhatsApp:', error);
    res.status(500).json({ error: 'Falha ao conectar com o WhatsApp' });
  }
};

// Controlador para verificar o status
const getStatus = async (req, res) => {
  res.status(200).json({
    connected: connectionStatus === 'connected',
    status: connectionStatus,
    number: connectedNumber
  });
};

// Controlador para obter o QR code atual
const getQrCode = async (req, res) => {
  if (!qrCode) {
    return res.status(404).json({ error: 'QR Code não disponível' });
  }
  
  res.status(200).json({
    qrCode: qrCode
  });
};

// Controlador para desconectar
const disconnect = async (req, res) => {
  try {
    if (whatsappClient) {
      await whatsappClient.logout();
      whatsappClient.destroy();
      whatsappClient = null;
      qrCode = null;
      connectionStatus = 'disconnected';
      connectedNumber = null;
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao desconectar WhatsApp:', error);
    res.status(500).json({ error: 'Falha ao desconectar do WhatsApp' });
  }
};

module.exports = {
  connect,
  getStatus,
  getQrCode,
  disconnect,
  getClient: () => whatsappClient
};
```

### Implementar Rotas WhatsApp (`src/routes/whatsapp.js`)

```javascript
const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp');

router.post('/connect', whatsappController.connect);
router.get('/status', whatsappController.getStatus);
router.get('/qrcode', whatsappController.getQrCode);
router.post('/disconnect', whatsappController.disconnect);

module.exports = router;
```

## Passo 5: Implementar Endpoints de Contatos e Chats

### Controlador de Contatos (`src/controllers/contacts.js`)

```javascript
const whatsappController = require('./whatsapp');

// Obter todos os contatos
const getAllContacts = async (req, res) => {
  try {
    const client = whatsappController.getClient();
    
    if (!client) {
      return res.status(400).json({ error: 'WhatsApp não está conectado' });
    }
    
    const contacts = await client.getContacts();
    
    // Filtrar e transformar para o formato esperado pelo frontend
    const formattedContacts = contacts
      .filter(contact => contact.name && contact.isMyContact)
      .map(contact => ({
        id: contact.id._serialized,
        name: contact.name || contact.pushname || 'Desconhecido',
        phone: contact.number || '',
        lastContact: new Date().toISOString().split('T')[0], // Data atual como fallback
        tags: [], // Tags vazias por padrão
        status: 'active'
      }));
    
    res.status(200).json(formattedContacts);
  } catch (error) {
    console.error('Erro ao obter contatos:', error);
    res.status(500).json({ error: 'Falha ao obter contatos' });
  }
};

// Sincronizar contatos do WhatsApp
const syncContacts = async (req, res) => {
  try {
    const client = whatsappController.getClient();
    
    if (!client) {
      return res.status(400).json({ error: 'WhatsApp não está conectado' });
    }
    
    await client.getContacts();
    
    res.status(200).json({
      success: true,
      message: 'Contatos sincronizados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao sincronizar contatos:', error);
    res.status(500).json({ error: 'Falha ao sincronizar contatos' });
  }
};

// Criar um novo contato
const createContact = async (req, res) => {
  try {
    const { name, phone, tags } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }
    
    // Gerar ID único
    const id = Date.now().toString();
    
    const newContact = {
      id,
      name,
      phone,
      lastContact: new Date().toISOString().split('T')[0],
      tags: tags || [],
      status: 'active'
    };
    
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Erro ao criar contato:', error);
    res.status(500).json({ error: 'Falha ao criar contato' });
  }
};

// Atualizar um contato existente
const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, tags } = req.body;
    
    if (!name && !phone && !tags) {
      return res.status(400).json({ error: 'Nenhum dado fornecido para atualização' });
    }
    
    // Simulamos o contato atualizado
    // Em uma implementação real, você buscaria do banco de dados
    const updatedContact = {
      id,
      name: name || 'Nome desconhecido',
      phone: phone || '000000000',
      lastContact: new Date().toISOString().split('T')[0],
      tags: tags || [],
      status: 'active'
    };
    
    res.status(200).json(updatedContact);
  } catch (error) {
    console.error(`Erro ao atualizar contato ${req.params.id}:`, error);
    res.status(500).json({ error: 'Falha ao atualizar contato' });
  }
};

// Excluir um contato
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Em uma implementação real, você removeria do banco de dados
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Erro ao excluir contato ${req.params.id}:`, error);
    res.status(500).json({ error: 'Falha ao excluir contato' });
  }
};

module.exports = {
  getAllContacts,
  syncContacts,
  createContact,
  updateContact,
  deleteContact
};
```

### Rotas de Contatos (`src/routes/contacts.js`)

```javascript
const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contacts');

router.get('/', contactsController.getAllContacts);
router.post('/', contactsController.createContact);
router.put('/:id', contactsController.updateContact);
router.delete('/:id', contactsController.deleteContact);
router.post('/sync', contactsController.syncContacts);

module.exports = router;
```

### Controlador de Chats (`src/controllers/chats.js`)

```javascript
const whatsappController = require('./whatsapp');

// Obter todas as conversas
const getAllChats = async (req, res) => {
  try {
    const client = whatsappController.getClient();
    
    if (!client) {
      return res.status(400).json({ error: 'WhatsApp não está conectado' });
    }
    
    const chats = await client.getChats();
    
    // Filtrar e transformar para o formato esperado pelo frontend
    const formattedChats = await Promise.all(chats.map(async (chat) => {
      // Tenta obter a última mensagem
      let lastMsg = '';
      let timestamp = new Date().toISOString();
      
      try {
        const messages = await chat.fetchMessages({ limit: 1 });
        if (messages && messages.length > 0) {
          lastMsg = messages[0].body;
          timestamp = messages[0].timestamp ? new Date(messages[0].timestamp * 1000).toISOString() : timestamp;
        }
      } catch (e) {
        console.error('Erro ao buscar mensagens:', e);
      }
      
      return {
        id: chat.id._serialized,
        name: chat.name || 'Chat',
        phone: chat.id.user || '',
        lastMessage: lastMsg || 'Nenhuma mensagem',
        timestamp: timestamp.split('T')[1].substring(0, 5), // Formato HH:MM
        unread: chat.unreadCount || 0,
        status: 'active'
      };
    }));
    
    res.status(200).json(formattedChats);
  } catch (error) {
    console.error('Erro ao obter conversas:', error);
    res.status(500).json({ error: 'Falha ao obter conversas' });
  }
};

// Obter mensagens de uma conversa específica
const getChatMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const client = whatsappController.getClient();
    
    if (!client) {
      return res.status(400).json({ error: 'WhatsApp não está conectado' });
    }
    
    const chat = await client.getChatById(id);
    if (!chat) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }
    
    const messages = await chat.fetchMessages({ limit: 50 });
    
    // Formatar as mensagens para o frontend
    const formattedMessages = messages.map(msg => ({
      id: msg.id._serialized,
      content: msg.body,
      timestamp: new Date(msg.timestamp * 1000).toISOString().split('T')[1].substring(0, 5), // Formato HH:MM
      type: msg.fromMe ? 'sent' : 'received',
      chatId: id
    }));
    
    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error(`Erro ao obter mensagens da conversa ${req.params.id}:`, error);
    res.status(500).json({ error: 'Falha ao obter mensagens' });
  }
};

// Enviar uma mensagem
const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Conteúdo da mensagem é obrigatório' });
    }
    
    const client = whatsappController.getClient();
    
    if (!client) {
      return res.status(400).json({ error: 'WhatsApp não está conectado' });
    }
    
    // Enviar a mensagem
    const msg = await client.sendMessage(id, content);
    
    // Criar objeto de resposta
    const now = new Date();
    const newMessage = {
      id: msg.id._serialized,
      content: content,
      timestamp: now.toTimeString().substring(0, 5), // Formato HH:MM
      type: 'sent',
      chatId: id
    };
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error(`Erro ao enviar mensagem para ${req.params.id}:`, error);
    res.status(500).json({ error: 'Falha ao enviar mensagem' });
  }
};

// Marcar conversa como lida
const markChatAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const client = whatsappController.getClient();
    
    if (!client) {
      return res.status(400).json({ error: 'WhatsApp não está conectado' });
    }
    
    const chat = await client.getChatById(id);
    if (!chat) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }
    
    await chat.sendSeen();
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Erro ao marcar conversa ${req.params.id} como lida:`, error);
    res.status(500).json({ error: 'Falha ao marcar conversa como lida' });
  }
};

module.exports = {
  getAllChats,
  getChatMessages,
  sendMessage,
  markChatAsRead
};
```

### Rotas de Chats (`src/routes/chats.js`)

```javascript
const express = require('express');
const router = express.Router();
const chatsController = require('../controllers/chats');

router.get('/', chatsController.getAllChats);
router.get('/:id/messages', chatsController.getChatMessages);
router.post('/:id/messages', chatsController.sendMessage);
router.put('/:id/read', chatsController.markChatAsRead);

module.exports = router;
```

## Passo 6: Configurar Scripts de Inicialização

Atualize o arquivo `package.json` para incluir scripts úteis:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "start:pm2": "pm2 start server.js --name whatsapp-backend"
  }
}
```

## Passo 7: Manter o Servidor Rodando com PM2

Para manter seu servidor rodando mesmo após desconexões ou reinicializações:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar o servidor com PM2
pm2 start server.js --name whatsapp-backend

# Configurar para iniciar após reiniciar o sistema
pm2 startup
pm2 save

# Outros comandos úteis:
pm2 status              # Ver status de todos os aplicativos
pm2 logs whatsapp-backend     # Ver logs do aplicativo
pm2 restart whatsapp-backend  # Reiniciar o aplicativo
pm2 stop whatsapp-backend     # Parar o aplicativo
```

## Passo 8: Configurar Nginx como Proxy Reverso (Opcional, mas Recomendado)

```bash
# Instalar Nginx
sudo apt install nginx

# Configurar site
sudo nano /etc/nginx/sites-available/whatsapp-backend
```

Conteúdo do arquivo:

```
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar o site e reiniciar Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-backend /etc/nginx/sites-enabled/
sudo nginx -t  # Testar a configuração
sudo systemctl restart nginx
```

## Configurar HTTPS com Certbot (Recomendado para Produção)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL e configurar HTTPS
sudo certbot --nginx -d seu-dominio.com

# Renovação automática (já configurado pelo Certbot)
```

## Solução de Problemas Comuns

### Problemas com o Puppeteer/Chromium

Se estiver enfrentando problemas com o Puppeteer ou Chromium:

```bash
# Instalar dependências adicionais do Chromium
sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

### Erros de Memória

Se o Node.js estiver saindo com erros de memória:

1. Aumente o limite de memória:
   ```bash
   NODE_OPTIONS=--max-old-space-size=4096 npm start
   ```

2. Ou adicione ao script em package.json:
   ```json
   "scripts": {
     "start": "node --max-old-space-size=4096 server.js"
   }
   ```

### Logs para Depuração

Implemente logs detalhados para depurar problemas:

```bash
# Instalar winston para logs avançados
npm install winston

# Criar um arquivo de log para referência futura
mkdir -p logs
touch logs/whatsapp.log
```

Crie um logger em `src/utils/logger.js`:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/whatsapp.log' })
  ]
});

module.exports = logger;
```

Use o logger em vez de `console.log`:

```javascript
const logger = require('../utils/logger');

// Em vez de console.log
logger.info('Servidor iniciado');
logger.error('Erro ao processar', error);
```

## Próximos Passos

Após configurar o backend:

1. Atualize o arquivo `src/config/api.ts` no frontend para apontar para seu backend
2. Teste a conexão com o WhatsApp escaneando o QR Code
3. Implemente recursos adicionais como:
   - Autenticação de usuários
   - Mensagens em massa
   - Templates de mensagens
   - Integração com outros serviços

---

Para mais informações sobre a biblioteca whatsapp-web.js, consulte a [documentação oficial](https://wwebjs.dev/).
