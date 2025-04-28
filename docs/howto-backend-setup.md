
# Guia Passo a Passo: Configuração do Backend WhatsApp

Este guia detalhado explica como configurar o backend do WhatsApp na sua VPS.

## Pré-requisitos

- Acesso SSH à sua VPS
- Conhecimentos básicos de linha de comando Linux
- Domínio configurado (opcional, mas recomendado)

## Passo 1: Preparar a VPS

```bash
# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js e NPM
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node -v
npm -v

# Instalar dependências do Chromium (necessárias para whatsapp-web.js)
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget libgbm-dev
```

## Passo 2: Configurar o Projeto Node.js

```bash
# Criar diretório para o projeto
mkdir -p /var/www/whatsapp-api
cd /var/www/whatsapp-api

# Inicializar projeto Node.js
npm init -y

# Instalar dependências principais
npm install express whatsapp-web.js qrcode dotenv cors helmet socket.io mongoose
```

## Passo 3: Criar Estrutura de Arquivos

```bash
mkdir -p src/{controllers,models,routes,services,websocket,whatsapp}
touch src/index.js .env README.md
```

## Passo 4: Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```bash
nano .env
```

Adicione o seguinte conteúdo:

```
# Configurações do Servidor
PORT=3000
NODE_ENV=production

# URLs
FRONTEND_URL=https://sua-url-do-lovable.app

# Segurança
JWT_SECRET=seu_token_secreto_aqui
SESSION_SECRET=outra_chave_secreta_aqui

# Database (opcional)
# DB_URI=mongodb://localhost:27017/whatsapp-api
```

## Passo 5: Implementar o Código Base

### Arquivo Principal (src/index.js)

```bash
nano src/index.js
```

Conteúdo:

```javascript
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const socketIo = require('socket.io');

// Carrega variáveis de ambiente
dotenv.config();

// Importa rotas
const whatsappRoutes = require('./routes/whatsapp');

// Inicializa app Express
const app = express();
const server = http.createServer(app);

// Configura Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializa WhatsApp Client
const WhatsAppClient = require('./whatsapp/client');
const whatsappClient = new WhatsAppClient(io);

// Rotas
app.use('/whatsapp', whatsappRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('WhatsApp API está funcionando!');
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = { app, server, io };
```

### Cliente WhatsApp (src/whatsapp/client.js)

```bash
nano src/whatsapp/client.js
```

Conteúdo:

```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

class WhatsAppClient {
  constructor(io) {
    this.io = io;
    this.client = null;
    this.qrCode = null;
    this.isReady = false;
    this.number = null;
    this.initializeClient();
  }

  initializeClient() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './whatsapp-sessions/'
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
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    this.client.on('qr', (qr) => {
      console.log('QR Code recebido');
      this.qrCode = qr;
      
      // Converte QR para base64
      qrcode.toDataURL(qr, (err, url) => {
        if (!err) {
          // Remove o prefixo data:image/png;base64,
          const base64Qr = url.replace(/^data:image\/png;base64,/, '');
          this.io.emit('whatsapp:qr', base64Qr);
        }
      });
    });

    this.client.on('ready', async () => {
      this.isReady = true;
      this.qrCode = null;
      
      try {
        const info = await this.client.getWid();
        this.number = info.user;
      } catch (error) {
        console.error('Erro ao obter número:', error);
      }
      
      console.log('Cliente WhatsApp pronto!');
      this.io.emit('whatsapp:status', { status: 'connected', number: this.number });
    });

    this.client.on('disconnected', (reason) => {
      this.isReady = false;
      this.qrCode = null;
      this.number = null;
      console.log('Cliente WhatsApp desconectado:', reason);
      this.io.emit('whatsapp:status', { status: 'disconnected', reason });
    });

    this.client.on('message', async (msg) => {
      console.log('Mensagem recebida:', msg.body);
      
      // Emite a mensagem recebida para o frontend
      if (!msg.isStatus && !msg.fromMe) {
        const chat = await msg.getChat();
        
        this.io.emit('whatsapp:message', {
          id: msg.id.id,
          content: msg.body,
          timestamp: new Date().toISOString(),
          type: 'received',
          chatId: msg.from,
          contact: {
            id: msg.from,
            name: chat.name || msg.from
          }
        });
      }
    });

    // Inicializa cliente
    this.client.initialize().catch(err => {
      console.error('Erro ao inicializar cliente WhatsApp:', err);
    });
  }

  async getStatus() {
    return {
      status: this.isReady ? 'connected' : this.qrCode ? 'connecting' : 'disconnected',
      qrCode: this.qrCode,
      number: this.number
    };
  }

  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      this.qrCode = null;
      this.number = null;
      return { success: true, message: 'Desconectado com sucesso' };
    }
    return { success: false, message: 'Cliente não inicializado' };
  }

  async reconnect() {
    await this.disconnect();
    this.initializeClient();
    return { success: true, message: 'Reconectando...' };
  }

  async sendMessage(to, message) {
    if (!this.isReady) {
      throw new Error('Cliente WhatsApp não está conectado');
    }

    try {
      // Formata o número se necessário
      const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;
      
      // Envia a mensagem
      const response = await this.client.sendMessage(formattedNumber, message);
      
      return {
        success: true,
        messageId: response.id.id,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }
}

module.exports = WhatsAppClient;
```

### Rotas WhatsApp (src/routes/whatsapp.js)

```bash
nano src/routes/whatsapp.js
```

Conteúdo:

```javascript
const express = require('express');
const WhatsAppClient = require('../whatsapp/client');
const router = express.Router();

// Referência para o cliente WhatsApp é passada aqui
let whatsappClient;

// Inicializa a referência do cliente WhatsApp
router.use((req, res, next) => {
  whatsappClient = req.app.get('whatsappClient');
  if (!whatsappClient) {
    return res.status(500).json({ success: false, message: 'WhatsApp client not initialized' });
  }
  next();
});

// Rota para conectar
router.post('/connect', async (req, res) => {
  try {
    whatsappClient.reconnect();
    res.json({ success: true, message: 'Iniciando conexão, aguarde o QR Code' });
  } catch (error) {
    console.error('Erro ao conectar:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rota para desconectar
router.post('/disconnect', async (req, res) => {
  try {
    const result = await whatsappClient.disconnect();
    res.json(result);
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rota para obter status
router.get('/status', async (req, res) => {
  try {
    const status = await whatsappClient.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Erro ao obter status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rota para enviar mensagem
router.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ success: false, message: 'Destinatário e mensagem são obrigatórios' });
    }
    
    const result = await whatsappClient.sendMessage(to, message);
    res.json(result);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

## Passo 6: Configure PM2 para Gerenciar o Processo

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar aplicação com PM2
cd /var/www/whatsapp-api
pm2 start src/index.js --name whatsapp-api

# Configurar PM2 para iniciar automaticamente após reboot
pm2 startup
pm2 save
```

## Passo 7: Configurar Nginx como Proxy Reverso (Opcional)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Criar configuração para o site
sudo nano /etc/nginx/sites-available/whatsapp-api
```

Adicione a seguinte configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;  # Substitua pelo seu domínio ou IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative a configuração:

```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-api /etc/nginx/sites-enabled/
sudo nginx -t  # Verifica se há erros na configuração
sudo systemctl restart nginx
```

## Passo 8: Configurar SSL com Let's Encrypt (Opcional, mas Recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com

# Renovação automática já é configurada pelo Certbot
```

## Passo 9: Configurar Firewall

```bash
# Instalar UFW se não estiver instalado
sudo apt install -y ufw

# Permitir SSH, HTTP e HTTPS
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Ativar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

## Passo 10: Atualizar o Frontend para Conectar ao Backend

Atualize o hook `useWhatsAppConnection.ts` no frontend para apontar para seu backend:

```typescript
// No arquivo src/hooks/useWhatsAppConnection.ts
// Substitua a URL do backend pela URL do seu servidor

export function useWhatsAppConnection() {
  // ... código existente

  const connect = async () => {
    try {
      setState(prev => ({ ...prev, status: 'connecting', error: null }));
      
      // URL do seu backend na VPS
      const response = await fetch('https://seu-dominio.com/whatsapp/connect', {
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
      // ... tratamento de erro
    }
  };

  const disconnect = async () => {
    try {
      // URL do seu backend na VPS
      await fetch('https://seu-dominio.com/whatsapp/disconnect', {
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
      // ... tratamento de erro
    }
  };

  // ... resto do código
}
```

## Passo 11: Teste e Solução de Problemas

### Verificar Logs do Servidor

```bash
pm2 logs whatsapp-api
```

### Verificar Conexão

Acesse seu frontend e tente conectar ao WhatsApp. Monitore os logs para identificar quaisquer problemas.

### Problemas Comuns e Soluções

1. **Erro de CORS**:
   - Verifique se a URL do frontend está corretamente configurada no backend
   - Certifique-se de que os cabeçalhos CORS estão corretos

2. **Erro ao gerar QR Code**:
   - Verifique se todas as dependências do Puppeteer estão instaladas
   - Aumente a memória disponível na VPS

3. **WhatsApp não conecta**:
   - Verifique as configurações de rede da VPS
   - Certifique-se de que o WhatsApp Web está funcionando no navegador

## Suporte

Se você encontrar problemas durante a configuração, verifique os logs do servidor e consulte a documentação das bibliotecas utilizadas.

---

© 2024 [Seu Nome/Empresa]. Todos os direitos reservados.
