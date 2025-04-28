
# Documentação do Frontend - Aplicação WhatsApp Integration

## Visão Geral

Esta aplicação frontend é responsável pela interface de usuário para integrar com o WhatsApp através de um backend que gerencia a conexão via WhatsApp Web. O frontend é construído utilizando tecnologias modernas:

- **React**: Biblioteca para construção da interface
- **TypeScript**: Tipagem estática para maior segurança no código
- **Tailwind CSS**: Framework CSS utilitário para estilização
- **Shadcn/UI**: Biblioteca de componentes baseada em Radix UI
- **React Query**: Gerenciamento de estado e cache para dados remotos
- **IndexedDB**: Armazenamento local para funcionamento offline

## Estrutura da Aplicação

### Páginas Principais

- **Dashboard**: Visão geral das estatísticas e atividades recentes
- **Chats**: Interface para visualização e gerenciamento de conversas
- **Contacts**: Gerenciamento de contatos e integração com WhatsApp
- **Settings**: Configurações da aplicação e conexão com WhatsApp
- **Automations**: Configuração de automações para mensagens (em desenvolvimento)

### Componentes Principais

#### WhatsAppConnection

O componente `WhatsAppConnection` gerencia o processo de conexão com WhatsApp e exibe:

- Status atual da conexão (conectado, conectando, desconectado)
- QR Code para escaneamento durante o processo de conexão
- Número de telefone conectado
- Botões para conectar ou desconectar

```jsx
// Exemplo de uso na página de Contatos
<WhatsAppConnection />
```

Este componente utiliza o hook `useWhatsAppConnection` para gerenciar o estado da conexão e realizar operações como conectar e desconectar.

#### ContactList

O componente `ContactList` exibe os contatos do usuário e permite:

- Visualizar todos os contatos
- Sincronizar contatos do WhatsApp
- Adicionar novos contatos através de um modal
- Editar contatos existentes
- Excluir contatos
- Ver tags associadas a cada contato

#### ChatList e ChatWindow

Estes componentes trabalham juntos para fornecer uma experiência completa de chat:

- `ChatList`: Lista todas as conversas com prévia da última mensagem
- `ChatWindow`: Exibe a conversa atual e permite enviar mensagens

## Arquitetura e Fluxo de Dados

A aplicação segue uma arquitetura de componentes com hooks customizados para gerenciar o estado e a lógica de negócios:

### Conexão com o WhatsApp

1. O usuário clica em "Conectar WhatsApp" no componente `WhatsAppConnection`
2. O hook `useWhatsAppConnection` envia uma solicitação para o backend
3. O backend inicia uma sessão do WhatsApp e gera um QR Code
4. O frontend exibe o QR Code para o usuário escanear
5. Após escanear, o backend confirma a conexão e o frontend atualiza o status

### Fluxo de Sincronização de Contatos

1. O usuário clica em "Sincronizar" na lista de contatos
2. O hook `useContacts` envia uma solicitação para o backend
3. O backend recupera os contatos do WhatsApp
4. Os contatos são salvos no servidor e retornados para o frontend
5. O frontend atualiza a lista de contatos e salva localmente (IndexedDB)

### Fluxo de Mensagens

1. O usuário seleciona uma conversa na `ChatList`
2. O hook `useChats` carrega as mensagens da conversa selecionada
3. As mensagens são exibidas no `ChatWindow`
4. O usuário digita uma mensagem e clica em "Enviar"
5. O hook `useChats` envia a mensagem para o backend
6. O backend encaminha a mensagem para o WhatsApp
7. A mensagem é adicionada à conversa e o estado é atualizado

## Hooks Customizados

### useWhatsAppConnection

```typescript
const { status, qrCode, number, error, connect, disconnect } = useWhatsAppConnection();
```

Este hook gerencia o estado da conexão com o WhatsApp e oferece métodos para:

- **connect()**: Iniciar uma nova conexão WhatsApp
- **disconnect()**: Encerrar a conexão atual
- **status**: Estado atual ('connected', 'connecting', 'disconnected')
- **qrCode**: Código QR para escanear (quando status = 'connecting')
- **number**: Número conectado (quando status = 'connected')
- **error**: Mensagem de erro (se ocorrer alguma falha)

### useContacts

```typescript
const { 
  contacts, 
  loading,
  syncingContacts,
  addContact, 
  updateContact, 
  deleteContact,
  syncContacts
} = useContacts();
```

Este hook gerencia os contatos do usuário com funcionalidades para:

- **contacts**: Lista de todos os contatos
- **loading**: Estado de carregamento
- **syncingContacts**: Estado da sincronização
- **syncContacts()**: Sincronizar contatos com o WhatsApp
- **addContact()**: Adicionar um novo contato
- **updateContact()**: Atualizar um contato existente
- **deleteContact()**: Excluir um contato

### useChats

```typescript
const { 
  chats, 
  messages, 
  activeChat, 
  setActiveChat, 
  sendMessage, 
  loading 
} = useChats();
```

Este hook gerencia as conversas e mensagens com funcionalidades para:

- **chats**: Lista de todas as conversas
- **messages**: Lista de mensagens da conversa ativa
- **activeChat**: ID da conversa atualmente selecionada
- **setActiveChat()**: Mudar a conversa ativa
- **sendMessage()**: Enviar uma nova mensagem
- **loading**: Estado de carregamento

## Estratégia de Armazenamento Offline

A aplicação utiliza IndexedDB (através do serviço `db.ts`) para armazenar dados localmente:

```typescript
// Exemplo de uso do serviço db.ts
await db.add('contacts', newContact);
await db.update('chats', updatedChat);
const localContacts = await db.getAll('contacts');
```

Isso permite:

1. **Funcionamento offline**: O usuário pode visualizar dados mesmo sem conexão com a internet
2. **Sincronização em segundo plano**: Dados são sincronizados com o servidor quando a conexão é reestabelecida
3. **Experiência mais rápida**: Dados são carregados instantaneamente do armazenamento local

## Configuração da API

O arquivo `src/config/api.ts` centraliza a configuração da API:

```typescript
export const API_CONFIG = {
  URL_BASE: 'https://seu-backend-vps.com/api', // URL do backend na VPS
  ENDPOINTS: {
    WHATSAPP: {
      CONNECT: '/whatsapp/connect',
      DISCONNECT: '/whatsapp/disconnect',
      STATUS: '/whatsapp/status',
      // outros endpoints...
    },
    // outros grupos de endpoints...
  }
};
```

Para conectar a um backend diferente, apenas a URL_BASE precisa ser alterada.

## Serviço API

O `src/services/api.ts` fornece métodos para comunicação com o backend:

```typescript
// Exemplos de uso do serviço API
const userData = await api.get('/users/profile');
const loginResponse = await api.post('/auth/login', { email, password });
await api.put(`/contacts/${id}`, contactData);
await api.delete(`/contacts/${id}`);
```

## Gerenciamento de Estado de UI

Para notificações e feedback ao usuário, a aplicação utiliza o sistema de toasts:

```typescript
const { toast } = useToast();

// Exemplo de uso
toast({
  title: "Contato adicionado",
  description: "O contato foi adicionado com sucesso."
});
```

## Responsividade

A interface é completamente responsiva, adaptando-se a diferentes tamanhos de tela:

- **Layout móvel**: Visualização simplificada com foco na tarefa atual
- **Layout desktop**: Visualização completa com múltiplos painéis visíveis

## Temas

A aplicação suporta temas claro e escuro através do Tailwind CSS:

```html
<!-- Exemplos de classes condicionais baseadas no tema -->
<div className="bg-white dark:bg-slate-800">
  <p className="text-gray-800 dark:text-gray-200">Texto adaptativo</p>
</div>
```

## Formulários

Para formulários com validação, a aplicação utiliza `react-hook-form` e `zod`:

```typescript
// Exemplo de schema de validação
const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido")
});

// Uso com react-hook-form
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { name: "", email: "" }
});
```

## Considerações de Segurança

- Dados sensíveis não são armazenados no frontend
- A comunicação com o backend deve ser feita via HTTPS
- Para implementação em produção, recomenda-se adicionar autenticação

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com o backend**:
   - Verifique se a URL do backend está correta em `src/config/api.ts`
   - Confirme que o CORS está configurado corretamente no backend

2. **QR Code não aparece**:
   - Verifique se o backend está em execução
   - Confirme que o Chrome/Chromium está instalado no servidor
   - Verifique os logs do backend para erros

3. **Contatos não sincronizam**:
   - Confirme que o WhatsApp está conectado
   - Verifique os logs para erros na API de contatos

## Extensão e Personalização

Para estender a aplicação:

1. **Adicionar novas páginas**:
   - Criar o arquivo da página em `src/pages/`
   - Adicionar a rota em `App.tsx`

2. **Adicionar novos componentes**:
   - Criar o componente em `src/components/`
   - Importar e usar onde necessário

3. **Modificar o tema**:
   - Ajustar as configurações em `tailwind.config.js`

## Conclusão

Este frontend é uma interface completa para interação com o WhatsApp através de um backend dedicado. Ele foi projetado para ser responsivo, fácil de usar e robusto, com capacidades offline e uma arquitetura bem organizada.

Para implementar o backend necessário, consulte a [Documentação do Backend](backend-documentation.md).
