# 🚀 Quick Start - SmartEditor com Gemini AI

## Início Rápido (5 minutos)

### 1. Clone e Configure

```bash
cd collaborative-editor-complete

# Frontend
cd frontend
npm install
cp .env.example .env
cd ..

# Backend
cd backend
npm install
cp .env.example .env
cd ..
```

### 2. Configure o Backend (.env)

Edite `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collaborative-editor
JWT_SECRET=seu_secret_muito_seguro_aqui_123456
NODE_ENV=development
```

### 3. Configure o Frontend (.env)

Edite `frontend/.env`:

```env
# URLs Backend
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# Gemini AI (OPCIONAL - funciona em modo mock sem API key)
VITE_GEMINI_API_KEY=your_api_key_here_or_leave_blank
VITE_USE_MOCK_AI=true
```

### 4. Inicie MongoDB

**Opção A: Docker**
```bash
docker-compose up -d
```

**Opção B: Local**
```bash
mongod
```

### 5. Inicie os Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Acesse a Aplicação

Abra o navegador em: **http://localhost:5173**

---

## ✨ Testando as Features AI (Modo Mock)

### Magic Toolbar
1. Crie um novo documento
2. Escreva qualquer texto
3. Selecione o texto com o mouse
4. Um menu flutuante aparece automaticamente
5. Clique em "Melhorar", "Resumir" ou "Traduzir"

### AI Chat Assistant
1. No editor, clique no botão **IA** (ícone ✨ no header)
2. Painel de chat desliza da direita
3. Digite: "Como posso melhorar este texto?"
4. Receba resposta contextual (mock)

### Saving Indicator
- Observe o indicador no header mudando:
  - 🔵 Salvando...
  - ✅ Salvo (com timestamp)

---

## 🔑 Ativando Gemini AI Real (Opcional)

### Passo 1: Obter API Key Gratuita

1. Acesse: https://makersuite.google.com/app/apikey
2. Login com Google
3. Clique "Create API Key"
4. Copie a chave

### Passo 2: Configurar

Edite `frontend/.env`:

```env
VITE_GEMINI_API_KEY=SUA_CHAVE_AQUI
VITE_USE_MOCK_AI=false
```

### Passo 3: Reiniciar

```bash
cd frontend
npm run dev
```

Agora todas as features de IA usarão o Gemini Pro real! 🎉

---

## 🎨 Features Premium Disponíveis

### ✅ Funcionando em Modo Mock (sem API key)
- ✨ Magic Toolbar (Melhorar, Resumir, Traduzir)
- 💬 AI Chat Assistant contextual
- 💾 Smart Saving Indicator
- 🌙 Dark Mode aprimorado
- 📝 Paper Sheet Layout
- 🎭 Animações fluidas
- 👥 Colaboração real-time

### ✅ Funcionando em Modo Real (com API key)
- Todas acima +
- 🧠 Respostas reais do Gemini Pro
- 🌐 Tradução precisa
- 📊 Resumos inteligentes
- ✍️ Reescrita profissional

---

## 📊 Estrutura do Projeto

```
collaborative-editor-complete/
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── components/         # 🆕 Componentes AI
│   │   │   ├── MagicToolbar.jsx
│   │   │   ├── AIChatPanel.jsx
│   │   │   ├── SavingIndicator.jsx
│   │   │   └── AILoadingState.jsx
│   │   ├── services/
│   │   │   ├── gemini.js       # 🆕 Serviço Gemini
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   └── pages/
│   │       └── Editor.jsx      # 🔥 Refatorado
│   └── tailwind.config.js      # 🎨 Design System
│
├── backend/                     # Node.js + Express
│   ├── src/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── socket/
│   └── server.js
│
├── FEATURES_AI.md              # 📖 Documentação completa
└── QUICKSTART.md               # 🚀 Este arquivo
```

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to MongoDB"
```bash
# Inicie MongoDB
docker-compose up -d
# ou
mongod
```

### Erro: "Port 5000 already in use"
- Mude a porta em `backend/.env`:
  ```env
  PORT=5001
  ```
- Atualize `frontend/.env`:
  ```env
  VITE_API_URL=http://localhost:5001
  ```

### Features AI não aparecem
- Limpe cache do navegador (Ctrl+Shift+R)
- Verifique console para erros
- Confirme que está em modo mock:
  ```env
  VITE_USE_MOCK_AI=true
  ```

### Dark mode não funciona
- Verifique `localStorage.theme`
- Clique no ícone Sol/Lua no header

---

## 📚 Documentação Adicional

- **FEATURES_AI.md**: Detalhes técnicos completos
- **ARCHITECTURE.md**: Arquitetura do sistema
- **README.md**: Overview geral

---

## 🎯 Checklist de Testes

- [ ] Registro de usuário
- [ ] Login
- [ ] Criar documento
- [ ] Editar texto
- [ ] Selecionar texto → Magic Toolbar aparece
- [ ] Clicar "Melhorar" → Texto transformado
- [ ] Abrir AI Chat Panel (botão IA)
- [ ] Enviar mensagem no chat
- [ ] Verificar saving indicator
- [ ] Toggle dark mode
- [ ] Compartilhar documento
- [ ] Adicionar colaborador
- [ ] Ver histórico de versões

---

## 💡 Dicas Rápidas

**Modo Demo Completo:**
- Use `VITE_USE_MOCK_AI=true` para testar sem API key
- Respostas são simuladas mas funcionais

**Performance:**
- Build otimizado: `npm run build`
- Preview: `npm run preview`

**Desenvolvimento:**
- Hot reload automático
- Erros aparecem no console

---

**Aproveite sua nova aplicação SaaS premium! 🚀✨**
