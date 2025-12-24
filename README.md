

```markdown
# 📝 CollabDocs - Editor Colaborativo Inteligente

![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=flat&logo=statuspage)
![React](https://img.shields.io/badge/React-v18-blue?style=flat&logo=react)
![Node](https://img.shields.io/badge/Node.js-v18+-green?style=flat&logo=nodedotjs)
![Yjs](https://img.shields.io/badge/Yjs-Offline%20First-purple?style=flat)
![AI](https://img.shields.io/badge/AI-Gemini%20Pro-orange?style=flat&logo=googlebard)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat&logo=docker)

> Um editor de texto de próxima geração, focado em colaboração em tempo real, suporte offline robusto e assistência de Inteligência Artificial generativa.

---

## 🔗 Links do Projeto

| 🚀 **Aplicação Online** | 👨‍💻 **Desenvolvedor** |
|:-------------------:|:-------------------:|
| [**Acessar CollabDocs**](https://smarteditor-frontend.onrender.com) | [**Gustavo Bezerra**](https://www.linkedin.com/in/gustavo-bezerradev/) |

---

## 💡 Sobre o Projeto

O **CollabDocs** é uma solução de edição de texto colaborativa projetada para superar as limitações de editores web tradicionais. Sua arquitetura **Offline-First**, baseada em CRDTs (Conflict-free Replicated Data Types), permite que os usuários continuem editando mesmo sem conexão com a internet. Assim que a conexão é restabelecida, o sistema sincroniza automaticamente todas as alterações sem conflitos de versão.

Além da colaboração em tempo real, o sistema integra a API do **Google Gemini**, transformando o editor em uma ferramenta de escrita assistida por IA capaz de reescrever textos, gerar resumos e oferecer autocompletar inteligente.

---

## 🛠️ Stack Tecnológica

O projeto utiliza uma arquitetura moderna e escalável, dividida entre cliente e servidor:

### **Frontend (Client)**
* **Core:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) para alta performance.
* **Estado:** [Zustand](https://github.com/pmndrs/zustand) para gerenciamento de estado global leve.
* **Editor:** [Quill.js](https://quilljs.com/) customizado com suporte a Rich Text.
* **Sincronização & Offline:** [Yjs](https://yjs.dev/) integrado com IndexedDB e WebSockets para garantir consistência de dados e colaboração P2P.
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com suporte nativo a Dark Mode e design responsivo.

### **Backend (Server)**
* **API:** [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/).
* **Real-time:** [Socket.IO](https://socket.io/) para gerenciamento de salas, presença e cursores.
* **Database:** [MongoDB](https://www.mongodb.com/) (com Mongoose) para persistência de documentos, usuários e logs.
* **Segurança:** Autenticação via JWT (JSON Web Tokens) e hash de senhas com Bcrypt.
* **AI:** Integração direta com Google Gemini API para processamento de linguagem natural.

### **DevOps & Infraestrutura**
* **Deploy:** Render (Web Services).
* **Containerização:** Docker e Docker Compose para orquestração de ambientes.

---

## ✨ Funcionalidades Principais

### 🔄 Colaboração Avançada
* **Edição Simultânea:** Múltiplos usuários no mesmo documento com latência mínima.
* **Cursor Awareness:** Visualização em tempo real da posição e seleção de texto de outros colaboradores.
* **Sincronização Resiliente:** Algoritmo CRDT garante que dados nunca sejam perdidos, independente da estabilidade da rede.

### 🤖 Inteligência Artificial (Magic Editor)
* **Magic Toolbar:** Ferramenta contextual para resumir, traduzir ou melhorar a escrita de trechos selecionados.
* **Ghost Text:** Sugestões de autocompletar estilo "Copilot" enquanto você digita.
* **Chat Contextual:** Painel lateral para discutir ideias e gerar conteúdo baseado no documento atual.

### 📊 Gestão e Produtividade
* **Dashboard Completo:** Criação, exclusão, favoritos e duplicação de documentos.
* **Analytics:** Rastreamento de palavras escritas, tempo de edição e "heatmaps" de produtividade.
* **Exportação:** Suporte nativo para PDF, DOCX, Markdown e HTML.
* **Templates:** Galeria de modelos reutilizáveis para agilizar a criação de documentos.

---

## 🚀 Executando Localmente

Siga os passos abaixo para rodar o projeto em sua máquina:

### Pré-requisitos
* Node.js (v18+)
* MongoDB (Local ou Atlas URI)
* Git

### 1. Clonar o Repositório
```bash
git clone [https://github.com/gustavoobezerra/editorcolaborativofrontend.git](https://github.com/gustavoobezerra/editorcolaborativofrontend.git)
cd editorcolaborativofrontend

```

### 2. Configurar e Rodar o Backend

```bash
cd backend
npm install

# Crie um arquivo .env na pasta backend com as variáveis:
# MONGODB_URI=sua_string_conexao
# JWT_SECRET=seu_segredo_super_seguro
# GEMINI_API_KEY=sua_api_key_google (opcional para IA)

npm run dev

```

### 3. Configurar e Rodar o Frontend

Em um novo terminal:

```bash
cd frontend
npm install
npm run dev

```

Acesse a aplicação em: `http://localhost:5173`

---

## 🐳 Executando com Docker

Se preferir, você pode subir todo o ambiente (Frontend + Backend + Banco de Dados) com um único comando:

```bash
docker-compose up --build

```

---

## 📬 Contato

Projeto desenvolvido por **Gustavo Bezerra**.

```

```
