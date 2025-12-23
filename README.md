# 📝 CollabDocs - Editor Colaborativo de Próxima Geração

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Node](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-v18-blue)
![Yjs](https://img.shields.io/badge/Yjs-CRDT-purple)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black)

Um editor de texto moderno e colaborativo de **alta performance**, permitindo edição **offline-first** com sincronização em tempo real sem conflitos. Desenvolvido para competir com Google Docs e Notion.

---

## ✨ Funcionalidades

### 🔥 Melhorias Estratégicas Implementadas

- **🌐 Modo Offline Inteligente (CRDT):** Edite documentos sem internet e sincronize automaticamente ao reconectar, **zero conflitos** garantido por Yjs
- **⚡ Performance Ultra-Rápida:** Debouncing, lazy loading e virtualização para experiência fluida mesmo com documentos grandes
- **🔐 Autenticação Segura:** Sistema completo de login e registro com JWT e bcrypt
- **📝 Editor Rich Text:** Suporte a formatação avançada (negrito, itálico, listas, imagens) com Quill.js
- **💾 Salvamento Automático:** IndexedDB persiste mudanças localmente + sync em background
- **📱 Design Responsivo:** Interface limpa e adaptável com Tailwind CSS + Dark Mode
- **👥 Presença Online:** Visualize quem está editando em tempo real com cursor awareness
- **🚀 Infraestrutura Escalável:** Hooks reutilizáveis e componentes otimizados

---

## 🚀 Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v16 ou superior)
- [MongoDB](https://www.mongodb.com/try/download/community) (Rodando localmente ou Atlas)
- Git

### ⚡ Início Rápido (Local)

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd collaborative-editor-complete
   ```

2. **Configure o Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edite o .env se necessário (MongoDB URI, JWT Secret)
   npm run dev
   ```
   > O servidor iniciará em `http://localhost:5000`

3. **Configure o Frontend:**
   Abra um novo terminal na raiz do projeto:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   > A aplicação abrirá em `http://localhost:5173`

### 🐳 Executar com Docker

Para uma configuração sem esforço, use o Docker Compose:

```bash
docker-compose up --build
```
Acesse a aplicação em `http://localhost:5173`.

---

## 📖 Guia de Uso

### Credenciais de Teste
Para testar rapidamente sem criar uma conta, utilize o usuário pré-configurado:
- **Email:** `gustavo@teste.com`
- **Senha:** `senha123`

### Comandos Úteis (Backend)
Caso precise resetar ou configurar o banco de dados manualmente:

- **Criar usuário de teste:**
  ```bash
  cd backend
  npm run create-user
  ```
- **Criptografar senhas (migração):**
  ```bash
  cd backend
  npm run hash-passwords
  ```

---

## 🛠️ Tecnologias

| Área | Tecnologias |
|------|-------------|
| **Frontend** | React 18, Vite, TailwindCSS, Zustand, Quill.js 1.3.7, **Yjs (CRDT)**, Socket.IO Client |
| **Offline Sync** | **y-indexeddb**, **y-websocket**, **y-protocols**, **quill-cursors** |
| **Performance** | **@tanstack/react-virtual**, **lodash.debounce**, IntersectionObserver API |
| **Backend** | Node.js, Express, Socket.IO, Mongoose, JWT, Bcrypt |
| **Banco de Dados** | MongoDB (com índices full-text) |
| **DevOps** | Docker, Docker Compose |
| **IA (Opcional)** | Google Gemini API

---

## 📂 Estrutura do Projeto

```
/
├── backend/            # Servidor API e WebSocket
│   ├── src/
│   │   ├── config/     # Configuração de DB
│   │   ├── controllers/# Lógica de negócios
│   │   ├── models/     # Schemas do MongoDB
│   │   ├── routes/     # Rotas da API
│   │   ├── socket/     # Eventos do Socket.IO
│   │   └── scripts/    # Scripts de utilidade
├── frontend/           # Aplicação Cliente React
│   ├── src/
│   │   ├── components/ # Componentes UI
│   │   │   ├── OfflineStatusIndicator.jsx ✨ NOVO
│   │   │   └── LazyImage.jsx ✨ NOVO
│   │   ├── hooks/      # Custom Hooks ✨ NOVO
│   │   │   ├── useDebounce.js
│   │   │   └── useIntersectionObserver.js
│   │   ├── pages/      # Páginas da aplicação
│   │   ├── services/   # Integração API/Socket
│   │   │   └── offlineSync.js ✨ NOVO (Yjs CRDT)
│   │   └── store/      # Gerenciamento de estado (Zustand)
├── IMPLEMENTATION_ROADMAP.md ✨ Guia das 8 melhorias restantes
├── IMPROVEMENTS_SUMMARY.md ✨ Resumo técnico das melhorias
├── QUICK_START_GUIDE.md ✨ Guia de testes e uso
└── docker-compose.yml  # Orquestração de containers
```

---

## 🔌 API & Socket Reference

### Endpoints Principais
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Autenticar usuário
- `GET /api/documents` - Listar documentos do usuário
- `GET /api/documents/:id` - Obter detalhes de um documento

### Eventos Socket.IO
- `join-document` - Entra na sala de edição de um documento
- `send-changes` - Envia delta de alterações do editor
- `receive-changes` - Recebe alterações de outros clientes
- `save-document` - Persiste o estado atual do documento

---



---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👥 Autores

**Desenvolvimento Original:** Gustavo de Oliveira Bezerra


**Versão:** 2.0 (com Offline Sync + Performance)
**Última Atualização:** 2025-12-23
