# 📝 Editor de Documentos Colaborativo em Tempo Real

![Status](https://img.shields.io/badge/Status-Active-success)
![Node](https://img.shields.io/badge/Node.js-v20+-green)
![React](https://img.shields.io/badge/React-v18-blue)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black)

Um editor de texto moderno e colaborativo, permitindo que múltiplos usuários editem documentos simultaneamente com sincronização em tempo real. Desenvolvido com a stack MERN (MongoDB, Express, React, Node.js).

---

## ✨ Funcionalidades

- **⏱️ Colaboração em Tempo Real:** Veja as alterações de outros usuários instantaneamente.
- **🔐 Autenticação Segura:** Sistema completo de login e registro com JWT e bcrypt.
- **📝 Editor Rich Text:** Suporte a formatação avançada (negrito, itálico, listas, imagens) com Quill.js.
- **💾 Salvamento Automático:** Seus documentos são salvos automaticamente enquanto você digita.
- **📱 Design Responsivo:** Interface limpa e adaptável construída com Tailwind CSS.
- **👥 Presença Online:** Visualize quem está editando o documento no momento.

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
| **Frontend** | React, Vite, TailwindCSS, Zustand, Quill.js, Socket.IO Client |
| **Backend** | Node.js, Express, Socket.IO, Mongoose, JWT, Bcrypt |
| **Banco de Dados** | MongoDB |
| **DevOps** | Docker, Docker Compose |

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
│   │   ├── pages/      # Páginas da aplicação
│   │   ├── services/   # Integração API/Socket
│   │   └── store/      # Gerenciamento de estado (Zustand)
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

## ❓ Troubleshooting

**Erro de Conexão com MongoDB:**
- Verifique se a URI no arquivo `.backend/.env` está correta.
- Se usar MongoDB Atlas, garanta que seu IP está na whitelist.
- Certifique-se de que o serviço do MongoDB está rodando (`mongod`).

**Problemas de Login:**
- Se o login falhar, verifique se o usuário existe no banco.
- Execute `npm run create-user` no backend para recriar o usuário de teste.
- Verifique se o `JWT_SECRET` está configurado no `.env`.

---

## 📄 Licença

Este projeto está sob a licença MIT.

---
**Autor:** Gustavo de Oliveira Bezerra
