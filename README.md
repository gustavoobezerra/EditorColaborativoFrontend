# 📝 Editor de Documentos Colaborativo em Tempo Real

**Autor:** Gustavo de Oliveira Bezerra  
**Data:** Dezembro 2025  
**Stack:** MERN (MongoDB, Express, React, Node.js) + Socket.IO

## 🎯 Visão Geral

Aplicação web full-stack que permite múltiplos usuários editarem documentos de texto simultaneamente em tempo real, similar ao Google Docs. Desenvolvido com arquitetura moderna utilizando WebSockets para sincronização instantânea.

## ⚡ Características Principais

- ✅ **Edição Colaborativa em Tempo Real** com Socket.IO
- ✅ **Rich Text Editor** com Quill.js (formatação, listas, cores, imagens)
- ✅ **Autenticação JWT** segura
- ✅ **Múltiplos usuários** editando simultaneamente
- ✅ **Auto-save** a cada 2 segundos
- ✅ **Indicadores de presença** (usuários online)
- ✅ **Gerenciamento de documentos** (criar, editar, deletar)
- ✅ **Interface responsiva** com TailwindCSS

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Socket.IO** - Comunicação em tempo real (WebSockets)
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

### Frontend
- **React 18** - UI Library
- **Vite** - Build tool
- **Zustand** - Gerenciamento de estado global
- **React Router** - Roteamento
- **Quill.js** - Rich text editor
- **Socket.IO Client** - Cliente WebSocket
- **TailwindCSS** - Estilização
- **Axios** - Cliente HTTP

## 📁 Estrutura do Projeto

```
collaborative-editor-complete/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Configuração MongoDB
│   │   ├── models/
│   │   │   ├── User.js               # Modelo de usuário
│   │   │   └── Document.js           # Modelo de documento
│   │   ├── controllers/
│   │   │   ├── authController.js     # Lógica de autenticação
│   │   │   └── documentController.js # Lógica de documentos
│   │   ├── middleware/
│   │   │   └── auth.js               # Middleware JWT
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Rotas de auth
│   │   │   └── documentRoutes.js     # Rotas de documentos
│   │   ├── socket/
│   │   │   └── documentSocket.js     # Handlers Socket.IO
│   │   └── server.js                 # Entrada principal
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/               # Componentes reutilizáveis
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Página de login
│   │   │   ├── Register.jsx          # Página de registro
│   │   │   ├── Dashboard.jsx         # Lista de documentos
│   │   │   └── Editor.jsx            # Editor colaborativo
│   │   ├── services/
│   │   │   ├── api.js                # Cliente HTTP
│   │   │   └── socket.js             # Cliente Socket.IO
│   │   ├── store/
│   │   │   └── index.js              # Zustand stores
│   │   ├── App.jsx                   # Componente principal
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Estilos globais
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **MongoDB** 7+ ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))

### Opção 1: Instalação Manual

#### 1️⃣ Clone o Repositório

```bash
git clone <seu-repo-url>
cd collaborative-editor-complete
```

#### 2️⃣ Configure o Backend

```bash
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Edite o arquivo .env e configure:
# - MONGODB_URI (se MongoDB não estiver em localhost)
# - JWT_SECRET (use uma string aleatória segura)

# Inicie o servidor
npm run dev
```

O backend estará rodando em `http://localhost:5000`

#### 3️⃣ Configure o Frontend

```bash
# Em outro terminal
cd ../frontend

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env

# Inicie o desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

### Opção 2: Docker Compose (Mais Fácil)

```bash
# Na raiz do projeto
docker-compose up --build

# Para parar
docker-compose down
```

Acesse: `http://localhost:5173`

## 📖 Como Usar

### 1. Criar Conta
- Acesse `http://localhost:5173/register`
- Preencha nome, email e senha
- Clique em "Criar Conta"

### 2. Fazer Login
- Acesse `http://localhost:5173/login`
- Entre com suas credenciais

### 3. Criar Documento
- No dashboard, clique em "Novo Documento"
- Você será redirecionado para o editor

### 4. Editar Colaborativamente
- Compartilhe a URL do documento
- Outros usuários podem editar simultaneamente
- Veja cursores e mudanças em tempo real

### 5. Formatação de Texto
- Use a toolbar para:
  - Headers (H1, H2, H3)
  - Negrito, itálico, sublinhado
  - Listas ordenadas e não ordenadas
  - Cores de texto e fundo
  - Links e imagens

## 🔧 API Endpoints

### Autenticação

```
POST /api/auth/register
Body: { name, email, password }
Response: { user, token }

POST /api/auth/login
Body: { email, password }
Response: { user, token }

GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user }
```

### Documentos

```
GET /api/documents
Headers: Authorization: Bearer <token>
Response: { documents: [] }

POST /api/documents
Headers: Authorization: Bearer <token>
Body: { title }
Response: { document }

GET /api/documents/:id
Headers: Authorization: Bearer <token>
Response: { document }

PUT /api/documents/:id
Headers: Authorization: Bearer <token>
Body: { title?, content? }
Response: { document }

DELETE /api/documents/:id
Headers: Authorization: Bearer <token>
Response: { message }
```

### Socket.IO Events

#### Client → Server

```javascript
// Entrar em um documento
socket.emit('join-document', { documentId, user });

// Enviar mudanças
socket.emit('send-changes', { documentId, delta });

// Salvar documento
socket.emit('save-document', { documentId, content });

// Sair do documento
socket.emit('leave-document', documentId);
```

#### Server → Client

```javascript
// Carregar documento
socket.on('load-document', (content) => {});

// Receber mudanças
socket.on('receive-changes', (delta) => {});

// Atualizar usuários
socket.on('users-update', (users) => {});

// Erros
socket.on('error', (error) => {});
```

## 🎓 Conceitos Aprendidos

Este projeto demonstra:

1. **Arquitetura Cliente-Servidor** moderna
2. **WebSockets** para comunicação bidirecional
3. **Sincronização em Tempo Real** entre múltiplos clientes
4. **Gerenciamento de Estado** com Zustand
5. **Autenticação JWT** end-to-end
6. **MongoDB** e modelagem de dados NoSQL
7. **RESTful APIs** com Express
8. **React Hooks** avançados (useEffect, useRef, useState)
9. **Event-driven Architecture** com Socket.IO
10. **Containerização** com Docker

## 🐛 Troubleshooting

### Erro de conexão MongoDB

```bash
# Verifique se MongoDB está rodando
mongod --version

# Inicie o MongoDB
mongod

# Ou use Docker
docker run -d -p 27017:27017 mongo:7
```

### Erro CORS

- Verifique se `CORS_ORIGIN` no backend .env está correto
- Deve ser `http://localhost:5173` (sem trailing slash)

### Socket não conecta

- Verifique se backend está rodando na porta 5000
- Verifique console do browser para erros
- Confirme `VITE_SOCKET_URL` no frontend .env

## 📝 Próximos Passos / Melhorias

- [ ] Implementar cursor colaborativo (mostrar onde outros estão editando)
- [ ] Sistema de comentários em linha
- [ ] Histórico de versões (undo/redo distribuído)
- [ ] Permissões granulares (owner, editor, viewer)
- [ ] Exportar para PDF/DOCX
- [ ] Busca em documentos
- [ ] Tags e organização
- [ ] Temas escuro/claro
- [ ] Notificações em tempo real
- [ ] Deploy em produção (Vercel + Railway/Render)

## 📄 Licença

MIT

## 👨‍💻 Autor

**Gustavo de Oliveira Bezerra**
- GitHub: [seu-github]
- LinkedIn: [seu-linkedin]
- Email: [seu-email]

---

**Desenvolvido como projeto de portfólio demonstrando habilidades em:**
- Backend com Node.js/Express
- Frontend com React
- Tempo Real com Socket.IO
- Banco de Dados NoSQL
- DevOps com Docker
