
# Projeto de Integração WhatsApp

Este projeto consiste em uma aplicação para integração com WhatsApp, permitindo a gestão de contatos, conversas e automações através de uma interface web moderna.

## Documentação

Este projeto está dividido em duas partes principais:

- **[Documentação do Frontend](docs/frontend-documentation.md)** - Detalhes sobre a implementação do frontend React
- **[Documentação do Backend](docs/backend-documentation.md)** - Instruções para implementação do backend Node.js

## Arquitetura

O sistema utiliza uma arquitetura cliente-servidor, onde:

- **Frontend**: Aplicação React hospedada no Lovable que se comunica com o backend
- **Backend**: Servidor Node.js hospedado na sua VPS que gerencia a conexão com WhatsApp

## Como Funciona

1. O frontend faz requisições para o backend através de endpoints REST
2. O backend processa essas requisições e gerencia a conexão com o WhatsApp
3. O WhatsApp é conectado através da biblioteca whatsapp-web.js no backend
4. As mensagens e contatos são sincronizados entre o WhatsApp e o aplicativo

## Requisitos para Execução

### Frontend

- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Backend (VPS)

- Node.js v14 ou superior
- NPM ou Yarn
- Chromium ou Google Chrome instalado
- 2GB RAM mínimo
- Sistema operacional Linux (recomendado Ubuntu)

## Configuração do Ambiente

### Configuração do Frontend

1. O frontend já está configurado e pode ser acessado através da plataforma Lovable.
2. Para conectar ao seu backend, você precisa atualizar o arquivo `src/config/api.ts` com a URL do seu backend:

```typescript
export const API_CONFIG = {
  URL_BASE: 'https://seu-dominio-vps.com/api', // Altere para a URL da sua VPS
  // ... resto da configuração
};
```

### Configuração do Backend na VPS

1. Acesse sua VPS via SSH
2. Clone o repositório do backend
3. Configure as variáveis de ambiente no arquivo `.env`
4. Instale as dependências: `npm install`
5. Execute o servidor: `npm start`

Para instruções detalhadas sobre a configuração do backend, veja o documento [Backend Setup](docs/howto-backend-setup.md).

## Implantação e Conexão

### Conectando Frontend ao Backend

No frontend, configure a URL do backend nos arquivos de configuração:

```typescript
// src/config/api.ts
const API_URL = 'https://seu-dominio-vps.com/api'; // ou http://seu-ip-vps:porta/api
```

### Configurando CORS no Backend

No backend, configure o CORS para permitir requisições do frontend:

```javascript
// No backend (server.js ou similar)
const cors = require('cors');
app.use(cors({
  origin: 'https://url-do-seu-projeto-lovable.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

## API Endpoints

O backend deve implementar os seguintes endpoints:

### WhatsApp

- `POST /api/whatsapp/connect` - Inicia uma nova sessão WhatsApp
- `GET /api/whatsapp/status` - Verifica o status da conexão
- `GET /api/whatsapp/qrcode` - Obtém QR Code para escanear
- `POST /api/whatsapp/disconnect` - Encerra a sessão atual

### Contatos

- `GET /api/contacts` - Lista todos os contatos
- `POST /api/contacts` - Cria um novo contato
- `PUT /api/contacts/:id` - Atualiza um contato existente
- `DELETE /api/contacts/:id` - Remove um contato
- `POST /api/contacts/sync` - Sincroniza contatos com WhatsApp

### Chats

- `GET /api/chats` - Lista todas as conversas
- `GET /api/chats/:id/messages` - Obtém mensagens de uma conversa
- `POST /api/chats/:id/messages` - Envia uma nova mensagem
- `PUT /api/chats/:id/read` - Marca conversa como lida

## Segurança

- Configure HTTPS para o backend
- Implemente autenticação para proteger os endpoints
- Configure firewall na VPS para limitar o acesso

## Funcionamento Offline

Este aplicativo implementa uma estratégia offline-first:

1. Os dados são armazenados em um banco de dados local (IndexedDB)
2. Quando online, os dados são sincronizados com o servidor
3. Quando offline, o aplicativo continua funcionando com os dados locais
4. Quando a conexão é reestabelecida, a sincronização ocorre automaticamente

## Suporte e Contato

Para dúvidas ou suporte, entre em contato através [seu contato].

---

© 2024 [Seu Nome/Empresa]. Todos os direitos reservados.
