
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

O frontend já está configurado e pode ser acessado através da plataforma Lovable.

### Configuração do Backend na VPS

1. Acesse sua VPS via SSH
2. Instale Node.js e NPM
3. Clone o repositório do backend
4. Configure as variáveis de ambiente no arquivo `.env`
5. Instale as dependências: `npm install`
6. Execute o servidor: `npm start`

## Implantação e Conexão

### Conectando Frontend ao Backend

No frontend, configure a URL do backend nos arquivos de configuração:

```typescript
// useWhatsAppConnection.ts
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

## Segurança

- Configure HTTPS para o backend
- Implemente autenticação para proteger os endpoints
- Configure firewall na VPS para limitar o acesso

## Suporte e Contato

Para dúvidas ou suporte, entre em contato através [seu contato].

---

© 2024 [Seu Nome/Empresa]. Todos os direitos reservados.
