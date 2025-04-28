
# Guia de Configuração do Backend - WhatsApp Integration para Windows Server 2022

Este documento fornece instruções detalhadas para configurar o servidor backend na sua VPS Windows Server 2022 para integração com o WhatsApp.

## Requisitos do Sistema

- Windows Server 2022
- Node.js 14+ e NPM 6+
- Google Chrome
- Mínimo 2GB de RAM
- Servidor Web (IIS ou Nginx para Windows) para proxy reverso (opcional, mas recomendado)

## Passo 1: Preparar o Ambiente na VPS Windows Server

### Instalar Node.js e NPM

1. Baixe o instalador do Node.js LTS para Windows no [site oficial](https://nodejs.org/).
2. Execute o instalador e siga as instruções na tela.
3. Marque a opção para adicionar Node.js ao PATH durante a instalação.
4. Verifique a instalação abrindo PowerShell e executando:

```powershell
node -v  # Deve mostrar v16.x.x ou superior
npm -v   # Deve mostrar 6.x.x ou superior
```

### Instalar o Google Chrome (necessário para o whatsapp-web.js)

1. Baixe o Google Chrome no [site oficial](https://www.google.com/chrome/).
2. Execute o instalador e siga as instruções na tela.

### Configurar Windows Firewall (se necessário)

```powershell
# Abrir porta 3000 (ou a porta que você escolher para a API)
New-NetFirewallRule -DisplayName "WhatsApp API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

## Passo 2: Configurar o Projeto Backend

### Criar Diretório do Projeto

```powershell
# Criar diretório para o projeto
New-Item -Path "C:\" -Name "whatsapp-backend" -ItemType "directory"
cd C:\whatsapp-backend

# Iniciar um novo projeto Node.js
npm init -y
```

### Instalar Dependências

```powershell
npm install express cors dotenv whatsapp-web.js express-validator helmet morgan
npm install nodemon --save-dev
```

### Estrutura de Arquivos Recomendada

```
C:\whatsapp-backend\
├── .env                   # Variáveis de ambiente
├── server.js              # Ponto de entrada principal
├── package.json           # Dependências e scripts
├── src\
│   ├── config\            # Configurações
│   │   └── whatsapp.js    # Configuração do WhatsApp
│   ├── controllers\       # Controladores para rotas
│   │   ├── whatsapp.js    # Controlador WhatsApp
│   │   ├── contacts.js    # Controlador de contatos
│   │   └── chats.js       # Controlador de chats
│   ├── routes\            # Rotas da API
│   │   ├── whatsapp.js    # Rotas do WhatsApp
│   │   ├── contacts.js    # Rotas de contatos
│   │   └── chats.js       # Rotas de mensagens
│   ├── models\            # Modelos de dados
│   ├── middleware\        # Middleware personalizado
│   └── utils\             # Utilitários
└── sessions\              # Diretório para sessões do WhatsApp
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
const path = require('path');
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

// Configuração do cliente WhatsApp com ajustes para Windows
const createWhatsAppClient = () => {
  return new Client({
    authStrategy: new LocalAuth({
      dataPath: path.resolve(process.env.WHATSAPP_SESSION_PATH || './sessions')
    }),
    puppeteer: {
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Caminho padrão do Chrome no Windows
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

O código para os endpoints de contatos e chats permanece o mesmo do exemplo Linux. Adapte os caminhos de arquivos usando a sintaxe do Windows (`\\` em vez de `/` para separadores de diretório).

## Passo 6: Configurar Scripts de Inicialização

Atualize o arquivo `package.json` para incluir scripts úteis:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## Passo 7: Configurar o Aplicativo como Serviço do Windows

Para manter seu servidor rodando em segundo plano:

### Usando PM2 (recomendado)

```powershell
# Instalar PM2 globalmente
npm install -g pm2 pm2-windows-startup

# Configurar PM2 para iniciar com o Windows
pm2-startup install

# Iniciar o servidor com PM2
pm2 start server.js --name whatsapp-backend

# Salvar configuração para reinício automático
pm2 save

# Outros comandos úteis:
pm2 status              # Ver status de todos os aplicativos
pm2 logs whatsapp-backend     # Ver logs do aplicativo
pm2 restart whatsapp-backend  # Reiniciar o aplicativo
pm2 stop whatsapp-backend     # Parar o aplicativo
```

### Usando o Gerenciador de Serviços do Windows (alternativa)

Você pode criar um serviço Windows usando ferramentas como `nssm` (Non-Sucking Service Manager):

1. Baixe e instale o [NSSM](https://nssm.cc/)
2. Abra o prompt de comando como administrador
3. Execute:

```cmd
nssm install WhatsAppBackend
```

4. Configure o caminho para o executável do Node.js e o caminho para o script server.js
5. Configure parâmetros adicionais como diretório de trabalho, variáveis de ambiente, etc.
6. Inicie o serviço:

```cmd
nssm start WhatsAppBackend
```

## Passo 8: Configurar IIS como Proxy Reverso (Opcional)

### Instalar e Configurar IIS

1. Abra o "Server Manager"
2. Clique em "Add roles and features"
3. Selecione "Web Server (IIS)"
4. Complete a instalação

### Configurar Proxy Reverso com URL Rewrite

1. Instale [URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) e [Application Request Routing](https://www.iis.net/downloads/microsoft/application-request-routing)
2. Abra o IIS Manager
3. No nível do servidor, abra "Application Request Routing"
4. Habilite o proxy
5. Crie um novo site ou use o site padrão
6. Adicione as regras de rewrite para encaminhar solicitações para http://localhost:3000

### Configuração Web.config de exemplo

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="ReverseProxyInboundRule1" stopProcessing="true">
                    <match url="(.*)" />
                    <conditions>
                        <add input="{CACHE_URL}" pattern="^(https?)://" />
                    </conditions>
                    <action type="Rewrite" url="http://localhost:3000/{R:1}" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```

## Configurar HTTPS com IIS (Recomendado para Produção)

1. Obtenha um certificado SSL (autoassinado ou de uma autoridade certificadora)
2. No IIS Manager, selecione seu site
3. No painel de "Actions" à direita, clique em "Bindings..."
4. Clique em "Add..." para adicionar um binding HTTPS
5. Selecione o certificado e clique em "OK"

## Solução de Problemas Comuns no Windows Server

### Problemas com o Puppeteer/Chromium

Se estiver enfrentando problemas com o Puppeteer:

1. Certifique-se de que o caminho do Chrome está correto no arquivo de configuração do WhatsApp.
2. Adicione o caminho do Chrome às variáveis de ambiente do sistema.
3. Tente executar Chrome com a flag `--no-sandbox` (já incluída na configuração).

### Erros de Acesso a Arquivos

No Windows, problemas de permissão são comuns:

1. Certifique-se de que o usuário que executa o aplicativo tem permissões completas na pasta do projeto
2. Execute o PowerShell como administrador para configurar permissões:

```powershell
# Conceder permissões completas para a pasta do projeto
icacls "C:\whatsapp-backend" /grant "Users":(OI)(CI)F /T
```

### Erros de Memória

Se o Node.js estiver saindo com erros de memória:

1. Aumente o limite de memória:
   ```powershell
   # Adicione ao arquivo .env ou defina como variável de ambiente
   set NODE_OPTIONS=--max-old-space-size=4096
   ```

2. Ou adicione ao script em package.json:
   ```json
   "scripts": {
     "start": "node --max-old-space-size=4096 server.js"
   }
   ```

### Logs para Depuração

Implemente logs detalhados para depurar problemas:

```powershell
# Instalar winston para logs avançados
npm install winston

# Criar um diretório de logs
mkdir logs
```

Crie um logger em `src/utils/logger.js`:

```javascript
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: path.join(__dirname, '..', '..', 'logs', 'whatsapp.log') 
    })
  ]
});

module.exports = logger;
```

## Recursos Adicionais para Windows Server

- [Documentação do Node.js](https://nodejs.org/en/docs/)
- [Documentação do IIS](https://docs.microsoft.com/en-us/iis/)
- [PM2 para Windows](https://github.com/jessety/pm2-installer)
- [Documentação whatsapp-web.js](https://wwebjs.dev/guide/)

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
