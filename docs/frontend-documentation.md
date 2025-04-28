
# Documentação do Frontend - Aplicação WhatsApp Integration

## Visão Geral

Esta aplicação frontend foi desenvolvida para permitir a integração com o WhatsApp através de um backend que gerencia a conexão via WhatsApp Web. O frontend é construído utilizando React, TypeScript, Tailwind CSS e a biblioteca de componentes shadcn/ui.

## Estrutura do Projeto

### Páginas Principais

- **Dashboard**: Visão geral das estatísticas e atividades recentes
- **Chats**: Interface para visualização e gerenciamento de conversas
- **Contacts**: Gerenciamento de contatos e integração com WhatsApp
- **Automations**: Configuração de automações para mensagens
- **Settings**: Configurações da aplicação

### Componentes Principais

#### WhatsApp Connection

O `WhatsAppConnection` é o componente responsável por exibir e gerenciar o estado da conexão com o WhatsApp. Ele é renderizado na página de Contatos e permite:

- Iniciar uma conexão com WhatsApp
- Exibir um QR Code para escanear com o celular
- Mostrar o status da conexão (conectado, conectando, desconectado)
- Desconectar o WhatsApp

```jsx
// Exemplo de uso na página de Contatos
<PageLayout>
  <div className="space-y-6">
    <WhatsAppConnection />
    <ContactList />
  </div>
</PageLayout>
```

#### Contact List

O componente `ContactList` exibe os contatos do usuário e permite:

- Visualizar todos os contatos
- Filtrar e buscar contatos
- Adicionar, editar e excluir contatos
- Visualizar tags associadas a cada contato

## Hooks Customizados

### useWhatsAppConnection

Este hook gerencia o estado da conexão com o WhatsApp e fornece métodos para conectar e desconectar. Ele mantém as seguintes informações:

- **status**: Estado atual da conexão ('connected', 'connecting', 'disconnected')
- **qrCode**: O código QR em formato base64 para escanear
- **number**: O número conectado, se houver
- **error**: Mensagem de erro, se ocorrer algum problema

```typescript
// Exemplo de uso do hook
const { status, qrCode, number, error, connect, disconnect } = useWhatsAppConnection();
```

### useContacts

Gerencia o estado dos contatos no frontend, com funcionalidades para:

- Carregar contatos do banco de dados local
- Adicionar novos contatos
- Atualizar contatos existentes
- Excluir contatos

```typescript
// Exemplo de uso do hook
const { contacts, loading, addContact, updateContact, deleteContact } = useContacts();
```

### useChats

Gerencia as conversas e mensagens no frontend, incluindo:

- Listagem de todas as conversas
- Carregamento de mensagens para uma conversa ativa
- Envio de novas mensagens
- Atualização do status de leitura

## Fluxo de Integração com WhatsApp

1. O usuário acessa a página de Contatos
2. Clica no botão "Conectar WhatsApp"
3. O frontend faz uma requisição para o backend (`/whatsapp/connect`)
4. O backend inicia uma sessão do WhatsApp e gera um QR Code
5. O frontend exibe o QR Code para o usuário escanear
6. Após escanear, o backend notifica o frontend sobre a conexão bem-sucedida
7. O frontend atualiza o status para "conectado" e exibe o número associado

## APIs Frontend-Backend

### Conexão WhatsApp

- **POST /whatsapp/connect**: Inicia uma nova conexão e retorna um QR Code
- **POST /whatsapp/disconnect**: Encerra a conexão atual
- **GET /whatsapp/status**: Verifica o status atual da conexão

### Contatos

- **GET /contacts**: Obtém a lista de contatos
- **POST /contacts**: Cria um novo contato
- **PUT /contacts/:id**: Atualiza um contato existente
- **DELETE /contacts/:id**: Remove um contato

### Chats

- **GET /chats**: Obtém a lista de conversas
- **GET /chats/:id/messages**: Obtém mensagens de uma conversa específica
- **POST /chats/:id/messages**: Envia uma nova mensagem

## Armazenamento de Dados

O frontend utiliza o IndexedDB (através do serviço `db.ts`) para armazenar dados localmente:

- Contatos
- Conversas
- Mensagens

Estes dados são sincronizados com o backend quando necessário.

## Temas e Estilização

A aplicação utiliza Tailwind CSS para estilização e o tema é configurado através dos arquivos:

- `tailwind.config.ts`: Configuração principal do Tailwind
- `index.css`: Estilos globais e customizações do tema

## Gerenciamento de Estado

- **Hooks React**: Para estado local dos componentes
- **Custom Hooks**: Para lógica reutilizável (useContacts, useChats, useWhatsAppConnection)
- **React Query**: Para cache e sincronização com o backend

## Notificações

O sistema de notificações utiliza o componente Toast do shadcn/ui para exibir:

- Erros de conexão
- Confirmações de ações (contato adicionado, mensagem enviada)
- Alertas do sistema

```jsx
// Exemplo de uso do sistema de toast
const { toast } = useToast();

toast({
  title: "Conectado",
  description: "WhatsApp conectado com sucesso"
});
```

## Considerações de Responsividade

A interface é completamente responsiva, adaptando-se a diferentes tamanhos de tela:

- Layout móvel: Menu colapsável, visualização simplificada
- Layout desktop: Sidebar fixa, visualização completa

## Fluxo de Autenticação

1. O usuário acessa a página de login
2. Após autenticação bem-sucedida, é redirecionado para o Dashboard
3. O token de autenticação é armazenado e utilizado para as requisições ao backend

## Debugando a Aplicação

Para depurar a aplicação, utilize:

- Console do navegador para logs
- React DevTools para inspecionar componentes e estado
- Network tab para monitorar requisições ao backend

## Segurança

As conexões com o backend são realizadas via HTTPS e os tokens de autenticação são armazenados de forma segura.
