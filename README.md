# ⚡ CollabDocs - Real-Time Collaborative Editor

![Status](https://img.shields.io/badge/Status-Online-success?style=flat&logo=statuspage)
![Socket.IO](https://img.shields.io/badge/Socket.io-Real--Time-black?style=flat&logo=socket.io)
![Yjs](https://img.shields.io/badge/Algorithm-CRDT-purple?style=flat)
![React](https://img.shields.io/badge/React-v18-blue?style=flat&logo=react)
![Node](https://img.shields.io/badge/Backend-Node.js-green?style=flat&logo=nodedotjs)
![AI](https://img.shields.io/badge/AI-Gemini%20Pro-orange?style=flat&logo=googlebard)

> Um editor de texto colaborativo de alta performance, projetado para oferecer sincronização instantânea entre múltiplos usuários e assistência de inteligência artificial.

---

## 🔗 Acesso Rápido

| 🚀 **Aplicação Live** | 👨‍💻 **Meu LinkedIn** |
|:-------------------:|:-------------------:|
| [**Acessar CollabDocs**](https://smarteditor-frontend.onrender.com) | [**Gustavo Bezerra**](https://www.linkedin.com/in/gustavo-bezerradev/) |

---

## 🎯 O Desafio Técnico

O objetivo central deste projeto foi resolver um dos problemas mais complexos do desenvolvimento web moderno: **Gerenciamento de Estado Distribuído em Tempo Real**.

Diferente de um CRUD tradicional, o CollabDocs precisa lidar com condições de corrida onde múltiplos usuários alteram o mesmo estado (documento) simultaneamente. A solução foi construída sobre três pilares:

1.  **Baixa Latência:** Uso de WebSockets para transmissão de dados em milissegundos.
2.  **Resolução de Conflitos:** Implementação de CRDTs (Conflict-free Replicated Data Types) para garantir que as edições de todos os usuários sejam fundidas (merge) sem sobrescrever dados.
3.  **Presença:** Monitoramento em tempo real de quem está online e onde está o cursor de cada usuário.

---

## 🛠️ Tecnologias e Arquitetura

A aplicação segue uma arquitetura moderna baseada em eventos.

### **Frontend (Client)**
* **React 18 + Vite:** Renderização otimizada e *build* rápido.
* **Socket.IO Client:** Gerenciamento da conexão persistente com o servidor.
* **Yjs + Quill Binding:** O coração da colaboração. O Yjs intercepta as mudanças no editor Quill e as propaga via rede, garantindo consistência matemática dos dados.
* **Zustand:** Gerenciamento de estado global (sessão do usuário, preferências).
* **Tailwind CSS:** Design system responsivo e moderno.

### **Backend (Server)**
* **Node.js & Express:** API REST para autenticação e gestão de recursos.
* **Socket.IO Server:** * Gerenciamento de "Rooms" (cada documento é uma sala).
    * Broadcast de eventos de cursor e edição.
* **MongoDB + Mongoose:** Persistência de dados (documentos, usuários e logs).
* **Google Gemini API:** Integração server-side para processamento de linguagem natural (IA).

### **DevOps**
* **Docker & Docker Compose:** Containerização completa do ambiente.
* **Render:** Plataforma de orquestração e deploy.

---

## ✨ Funcionalidades Principais

### 🔄 Colaboração em Tempo Real (Live)
* **Multi-usuário:** Várias pessoas editando o mesmo documento simultaneamente.
* **Live Cursors:** Veja exatamente onde outros usuários estão clicando ou selecionando texto, com identificação por cores e nomes.
* **Atualização Instantânea:** As mudanças aparecem na tela de todos os participantes em milissegundos.

### 🤖 Inteligência Artificial (AI Powered)
* **Magic Editor:** Selecione um texto e peça para a IA reescrever, corrigir gramática ou alterar o tom.
* **Context Chat:** Chat lateral que "lê" o seu documento e responde perguntas sobre ele.
* **Ghost Text:** Sugestões de autocompletar enquanto você digita.

### 📊 Produtividade
* **Analytics:** Métricas de tempo de escrita e volume de palavras.
* **Templates:** Criação rápida de documentos baseada em modelos.
* **Exportação:** PDF, DOCX e Markdown.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* Node.js v18+
* MongoDB
* Git

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/gustavoobezerra/editorcolaborativofrontend.git](https://github.com/gustavoobezerra/editorcolaborativofrontend.git)
    cd editorcolaborativofrontend
    ```

2.  **Backend (Servidor & WebSocket):**
    ```bash
    cd backend
    npm install
    # Crie um arquivo .env com suas credenciais (veja .env.example)
    npm run dev
    ```

3.  **Frontend (Interface):**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Acesse:** `http://localhost:5173`

---

## 🐳 Docker (Recomendado)

Para subir toda a infraestrutura (App + Banco de Dados) com um comando:

```bash
docker-compose up --build
