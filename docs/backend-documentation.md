
# Documentação do Backend - Integração WhatsApp

## Visão Geral

O backend da aplicação é responsável por gerenciar a conexão com o WhatsApp Web, processar mensagens, gerenciar contatos e fornecer uma API RESTful para comunicação com o frontend. Este documento detalha a implementação e requisitos para o backend.

## Tecnologias Necessárias

- **Node.js**: Ambiente de execução
- **Express**: Framework web
- **whatsapp-web.js**: Biblioteca para integração com WhatsApp Web
- **Socket.io**: Comunicação em tempo real com o frontend
- **MongoDB/MySQL/PostgreSQL**: Banco de dados (opcional)

## Instalação e Configuração

### Requisitos do Sistema

- Node.js v14 ou superior
- NPM ou Yarn
- Acesso à internet para conexão com WhatsApp
- Navegador Chromium (opcional, para headless mode)

### Passos para Instalação

1. Clone o repositório do backend
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente (veja abaixo)
4. Inicie o servidor: `npm start`

### Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```
PORT=3000
FRONTEND_URL=https://seu-frontend.com
SESSION_SECRET=sua-chave-secreta
DB_URI=mongodb://localhost/whatsapp-api (opcional)
```

## Estrutura do Backend

### Diretórios Principais

```
backend/
├── src/
│   ├── controllers/    # Controladores da API
│   ├── models/         # Modelos de dados
│   ├── routes/         # Rotas da API
│   ├── services/       # Serviços de negócio
│   ├── websocket/      # Configuração do Socket.io
│   ├── whatsapp/       # Lógica da integração WhatsApp
│   └── index.js        # Ponto de entrada
├── .env                # Variáveis de ambiente
├── package.json        # Dependências
└── README.md           # Documentação
```

### Componentes Principais

#### Cliente WhatsApp

O componente central que gerencia a conexão com o WhatsApp Web usando whatsapp-web.js:

```javascript
// Exemplo de implementação básica
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

class WhatsAppClient {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { headless: true }
    });
    
    this.isReady = false;
    this.qrCode = null;
    this.connections = new Map(); // Para tracking de conexões de socket
    
    this.initializeClient();
  }
  
  initializeClient() {
    this.client.on('qr', (qr) => {
      this.qrCode = qr;
      this.broadcastQRCode(qr);
    });
    
    this.client.on('ready', () => {
      this.isReady = true;
      this.qrCode = null;
      this.broadcastStatus('connected');
    });
    
    this.client.on('disconnected', () => {
      this.isReady = false;
      this.broadcastStatus('disconnected');
    });
    
    this.client.on('message', this.handleIncomingMessage.bind(this));
    
    this.client.initialize();
  }
  
  // Outros métodos...
}
```

## API Endpoints

### Autenticação WhatsApp

- **POST /api/whatsapp/connect**
  - Inicia uma nova sessão do WhatsApp
  - Retorna um código QR para escanear
  - Resposta: `{ success: true, qrCode: "base64-encoded-qr" }`

- **POST /api/whatsapp/disconnect**
  - Desconecta a sessão atual do WhatsApp
  - Resposta: `{ success: true, message: "Disconnected" }`

- **GET /api/whatsapp/status**
  - Verifica o status atual da conexão
  - Resposta: `{ status: "connected|connecting|disconnected", number: "+5511987654321" }`

### Contatos

- **GET /api/contacts**
  - Lista todos os contatos do WhatsApp
  - Parâmetros opcionais: `page`, `limit`, `search`
  - Resposta: `{ contacts: [...], total: 100, page: 1, pages: 10 }`

- **POST /api/contacts**
  - Cria um novo contato
  - Corpo: `{ name: "João Silva", phone: "+5511987654321", tags: ["cliente"] }`
  - Resposta: `{ success: true, contact: { id: "1", name: "João Silva", ... } }`

- **GET /api/contacts/:id**
  - Obtém detalhes de um contato específico
  - Resposta: `{ id: "1", name: "João Silva", ... }`

- **PUT /api/contacts/:id**
  - Atualiza um contato existente
  - Corpo: `{ name: "João Silva Atualizado", tags: ["vip"] }`
  - Resposta: `{ success: true, contact: { id: "1", name: "João Silva Atualizado", ... } }`

- **DELETE /api/contacts/:id**
  - Remove um contato
  - Resposta: `{ success: true }`

### Mensagens

- **GET /api/chats**
  - Lista todas as conversas
  - Parâmetros opcionais: `page`, `limit`
  - Resposta: `{ chats: [...], total: 50, page: 1, pages: 5 }`

- **GET /api/chats/:chatId/messages**
  - Lista mensagens de uma conversa específica
  - Parâmetros opcionais: `page`, `limit`
  - Resposta: `{ messages: [...], total: 100, page: 1, pages: 10 }`

- **POST /api/chats/:chatId/messages**
  - Envia uma nova mensagem
  - Corpo: `{ content: "Olá, como posso ajudar?", type: "text" }`
  - Resposta: `{ success: true, message: { id: "msg123", content: "...", ... } }`

## Comunicação em Tempo Real (WebSockets)

O backend utiliza Socket.io para notificar o frontend em tempo real sobre:

- Novos QR Codes gerados
- Alterações no status da conexão
- Novas mensagens recebidas
- Atualizações de status de entrega/leitura

### Eventos do Socket

- **whatsapp:qr**: Emitido quando um novo QR Code é gerado
- **whatsapp:status**: Emitido quando o status da conexão muda
- **whatsapp:message**: Emitido quando uma nova mensagem é recebida
- **whatsapp:message-status**: Emitido quando o status de uma mensagem muda

## Tratamento de Sessão do WhatsApp

### Persistência de Sessão

O backend utiliza a estratégia `LocalAuth` da biblioteca whatsapp-web.js para persistir a sessão localmente:

```javascript
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './whatsapp-sessions/'
  })
});
```

Isso permite que a sessão seja restaurada após reiniciar o servidor, sem necessidade de escanear o QR Code novamente.

### Multi-sessão

Para suportar múltiplos usuários, cada um com sua própria conexão de WhatsApp:

```javascript
// Exemplo de estratégia multi-usuário
const clients = new Map(); // userId -> WhatsAppClient

function getOrCreateClient(userId) {
  if (!clients.has(userId)) {
    const client = new WhatsAppClient(userId);
    clients.set(userId, client);
  }
  return clients.get(userId);
}
```

## Segurança

### CORS

Configure o CORS para permitir apenas requisições do seu frontend:

```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Autenticação e Autorização

Implemente autenticação JWT para proteger os endpoints:

```javascript
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Uso
app.use('/api', authMiddleware);
```

## Tratamento de Erros

Implemente um middleware global para tratar erros:

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});
```

## Logs e Monitoramento

Utilize Winston ou Morgan para logging:

```javascript
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Em ambiente de desenvolvimento, adicione console
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## Deployment

### Requisitos do Servidor

- Linux (recomendado Ubuntu 20.04+)
- Node.js v14+
- Chromium ou Chrome instalado (para whatsapp-web.js)
- 2GB RAM mínimo
- Acesso à porta configurada (padrão 3000)

### Passos para Deploy

1. Configure o servidor com as dependências necessárias
2. Clone o repositório
3. Instale as dependências: `npm install --production`
4. Configure variáveis de ambiente
5. Use PM2 para gerenciar o processo: `pm2 start src/index.js --name whatsapp-api`
6. Configure Nginx como proxy reverso (opcional)
7. Configure SSL com Let's Encrypt (opcional, mas recomendado)

### Exemplo de configuração Nginx

```nginx
server {
    listen 80;
    server_name api.seu-dominio.com;

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

## Considerações para VPS

### Requisitos Mínimos da VPS

- CPU: 1 vCore
- RAM: 2GB
- Disco: 20GB SSD
- Sistema Operacional: Ubuntu 20.04 ou superior
- Conexão: Boa largura de banda

### Configurações Adicionais

- Configure um firewall (UFW) para expor apenas as portas necessárias
- Instale e configure Fail2ban para proteção contra ataques de força bruta
- Configure backups automáticos para as sessões do WhatsApp
- Considere usar Docker para facilitar a implantação e isolamento

## Troubleshooting

### Problemas Comuns

1. **QR Code não aparece**
   - Verifique se o Puppeteer está instalado corretamente
   - Instale as dependências do Chrome: `apt-get install gconf-service libasound2 [...] xvfb`

2. **WhatsApp desconecta frequentemente**
   - Verifique se a opção "WhatsApp Web autológico" no seu telefone está ativada
   - Use a estratégia LocalAuth para persistir a sessão

3. **Erros de memória**
   - Aumente a RAM disponível
   - Configure limites de memória para o Puppeteer: `--disable-dev-shm-usage --no-sandbox`

4. **CORS não funcionando**
   - Verifique se a URL do frontend está configurada corretamente
   - Certifique-se que os cabeçalhos CORS estão corretos

## Recursos Adicionais

- [Documentação whatsapp-web.js](https://wwebjs.dev/guide/)
- [API whatsapp-web.js](https://docs.wwebjs.dev/index.html)
- [Express.js](https://expressjs.com/)
- [Socket.io](https://socket.io/docs/)
