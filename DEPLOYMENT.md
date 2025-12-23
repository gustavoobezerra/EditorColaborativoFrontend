# 🚀 Guia de Deploy - SmartEditor em Produção

## 📋 Visão Geral

**Arquitetura de Deploy:**
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│   MongoDB    │
│   (Vercel)   │     │ (Render/Fly) │     │   (Atlas)    │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Stack:**
- Frontend: React + Vite → **Vercel**
- Backend: Node.js + Express + Socket.IO → **Render** (recomendado)
- Database: MongoDB → **MongoDB Atlas** (cloud grátis)

---

## 🎯 Opção 1: Deploy Completo (Recomendado)

### Passo 1: MongoDB Atlas (Database Cloud)

#### 1.1 Criar Conta e Cluster

```bash
1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie conta gratuita (Google/Email)
3. Crie novo projeto: "SmartEditor"
4. Deploy: FREE Shared Cluster (M0)
   - Provider: AWS
   - Region: São Paulo (sa-east-1) ou mais próxima
   - Cluster Name: SmartEditorCluster
```

#### 1.2 Configurar Acesso

```bash
# Database Access (Usuário)
1. Database Access → Add New Database User
   - Username: smarteditor-admin
   - Password: [gere senha forte] → Copie!
   - Role: Atlas Admin

# Network Access (IP)
2. Network Access → Add IP Address
   - Opção 1 (Desenvolvimento): "Allow Access from Anywhere" (0.0.0.0/0)
   - Opção 2 (Seguro): Adicione IPs específicos do Render
```

#### 1.3 Obter Connection String

```bash
1. Database → Connect → Drivers
2. Copie string de conexão:

   mongodb+srv://smarteditor-admin:<password>@smarteditorcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

3. Substitua <password> pela senha real
4. Adicione nome do database:

   mongodb+srv://smarteditor-admin:SENHA@smarteditorcluster.xxxxx.mongodb.net/smarteditor?retryWrites=true&w=majority
```

---

### Passo 2: Backend no Render (Node.js + Socket.IO)

#### 2.1 Preparar Repositório

```bash
# 1. Inicializar Git (se não tiver)
cd collaborative-editor-complete
git init
git add .
git commit -m "Initial commit - SmartEditor"

# 2. Criar repositório no GitHub
# https://github.com/new
# Nome: smarteditor-backend
# Visibilidade: Private (recomendado)

# 3. Push para GitHub
git remote add origin https://github.com/SEU_USUARIO/smarteditor-backend.git
git branch -M main
git push -u origin main
```

#### 2.2 Preparar Backend para Deploy

**Criar arquivo `backend/vercel.json` (alternativa):**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

**⚠️ PROBLEMA:** Vercel não suporta WebSockets (Socket.IO) bem!

**SOLUÇÃO:** Use Render.com para backend

#### 2.3 Deploy no Render

```bash
1. Acesse: https://render.com/
2. Crie conta (GitHub OAuth recomendado)
3. Dashboard → New → Web Service
4. Connect GitHub → Selecione repositório
```

**Configuração do Web Service:**
```yaml
Name: smarteditor-backend
Environment: Node
Region: Oregon (US West) ou Frankfurt (EU)
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: npm start
Plan: Free
```

**Environment Variables (Render):**
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://smarteditor-admin:SENHA@cluster.mongodb.net/smarteditor
JWT_SECRET=GERE_SENHA_FORTE_AQUI_64_CARACTERES
JWT_EXPIRE=7d
CORS_ORIGIN=https://seu-app.vercel.app
```

**Gerar JWT_SECRET forte:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2.4 Verificar Deploy

```bash
# Render fornecerá URL:
https://smarteditor-backend.onrender.com

# Teste endpoints:
curl https://smarteditor-backend.onrender.com/api/auth/health
# Deve retornar: {"status":"ok"}
```

---

### Passo 3: Frontend na Vercel

#### 3.1 Atualizar Variáveis de Ambiente

**Edite `frontend/.env`:**
```env
# API URLs (Render backend)
VITE_API_URL=https://smarteditor-backend.onrender.com
VITE_SOCKET_URL=https://smarteditor-backend.onrender.com

# Gemini AI (obtenha em https://makersuite.google.com/app/apikey)
VITE_GEMINI_API_KEY=AIzaSy...sua_chave_real
VITE_USE_MOCK_AI=false
```

#### 3.2 Criar `vercel.json` no Frontend

**Criar arquivo `frontend/vercel.json`:**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 3.3 Deploy na Vercel

**Opção A: Vercel CLI (Recomendado)**

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
cd frontend
vercel login
vercel

# Perguntas:
# - Set up and deploy? Yes
# - Which scope? [Sua conta]
# - Link to existing project? No
# - Project name? smarteditor
# - Directory? ./
# - Override settings? No

# 3. Deploy para produção
vercel --prod
```

**Opção B: Vercel Dashboard**

```bash
1. Acesse: https://vercel.com/new
2. Import Git Repository → GitHub
3. Selecione repositório (ou crie novo)
4. Configure:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist
5. Environment Variables (copie do .env):
   VITE_API_URL=https://smarteditor-backend.onrender.com
   VITE_SOCKET_URL=https://smarteditor-backend.onrender.com
   VITE_GEMINI_API_KEY=AIzaSy...
   VITE_USE_MOCK_AI=false
6. Deploy
```

#### 3.4 Obter URL Final

```bash
Vercel fornecerá:
https://smarteditor-abc123.vercel.app

# Configurar domínio customizado (opcional):
Vercel Dashboard → Domains → Add Domain
```

---

### Passo 4: Atualizar CORS no Backend

**Importante:** Atualize `CORS_ORIGIN` no Render com a URL da Vercel

```bash
# Render Dashboard → smarteditor-backend → Environment
CORS_ORIGIN=https://smarteditor-abc123.vercel.app

# Ou múltiplas origens (edite backend/src/server.js):
const corsOptions = {
  origin: [
    'https://smarteditor-abc123.vercel.app',
    'http://localhost:5173' // dev local
  ],
  credentials: true
};
```

---

## 🎯 Opção 2: Tudo na Vercel (Mais Simples, Limitado)

**⚠️ AVISO:** Vercel não suporta WebSockets/Socket.IO muito bem. Colaboração em tempo real pode não funcionar.

### Monorepo na Vercel

**Estrutura:**
```
projeto/
├── api/           ← Backend como Serverless Functions
│   ├── auth.js
│   └── documents.js
└── frontend/      ← Frontend React
```

**Não recomendado para este projeto** porque:
- Socket.IO não funciona em serverless
- Colaboração em tempo real ficará quebrada
- Precisa reescrever backend para REST puro

---

## 🎯 Opção 3: Railway (Alternativa ao Render)

Railway é outra opção gratuita que suporta Node.js + Socket.IO

### Deploy no Railway

```bash
1. Acesse: https://railway.app/
2. Sign up com GitHub
3. New Project → Deploy from GitHub repo
4. Configure:
   - Select Repo: seu-repositorio
   - Root Directory: backend
   - Start Command: npm start
5. Variables:
   - MONGODB_URI=mongodb+srv://...
   - JWT_SECRET=...
   - CORS_ORIGIN=https://sua-app.vercel.app
6. Deploy
```

**Railway fornece:**
```
https://smarteditor-backend-production.up.railway.app
```

---

## ✅ Checklist de Deploy

### Antes do Deploy:

- [ ] Código commitado no Git
- [ ] `.env` adicionado ao `.gitignore`
- [ ] Build local funciona: `npm run build`
- [ ] Testes passando (se tiver)

### Deploy Backend:

- [ ] MongoDB Atlas configurado
- [ ] Connection string funcionando
- [ ] Render/Railway configurado
- [ ] Environment variables setadas
- [ ] CORS configurado com URL do frontend
- [ ] Endpoint de health check funcionando

### Deploy Frontend:

- [ ] Vercel configurado
- [ ] Environment variables setadas
- [ ] Build funcionando na Vercel
- [ ] API URL apontando para backend correto
- [ ] Gemini API key configurada

### Pós-Deploy:

- [ ] Teste login/cadastro
- [ ] Teste criação de documento
- [ ] Teste edição em tempo real (Socket.IO)
- [ ] Teste Magic Toolbar (AI)
- [ ] Teste AI Chat
- [ ] Teste Ghost Text
- [ ] Teste dark mode
- [ ] Teste compartilhamento

---

## 🔧 Troubleshooting

### Erro: "CORS Policy"

**Problema:** Frontend não consegue acessar backend

**Solução:**
```bash
# Backend Render → Environment Variables
CORS_ORIGIN=https://sua-app.vercel.app

# Ou edite backend/src/server.js:
app.use(cors({
  origin: 'https://sua-app.vercel.app',
  credentials: true
}));
```

### Erro: "Socket.IO Handshake Failed"

**Problema:** WebSocket não conecta

**Solução:**
```javascript
// frontend/src/services/socket.js
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], // Fallback para polling
  withCredentials: true
});
```

### Erro: "MongoDB Connection Failed"

**Problema:** Backend não conecta no MongoDB Atlas

**Solução:**
```bash
1. Verifique connection string (senha correta?)
2. MongoDB Atlas → Network Access → Add 0.0.0.0/0
3. Verifique IP do Render:
   - Render Dashboard → Service → Connect → Outbound IPs
   - Adicione esses IPs no MongoDB Atlas
```

### Erro: "Environment Variables não carregam"

**Problema:** `VITE_*` variáveis undefined

**Solução:**
```bash
# Vercel: Variáveis DEVEM começar com VITE_
VITE_API_URL=...
VITE_GEMINI_API_KEY=...

# Rebuild deploy:
vercel --prod --force
```

---

## 💰 Custos

### Tier Gratuito (Recomendado para começar):

| Serviço | Plano Free | Limites |
|---------|-----------|---------|
| **Vercel** | Hobby | 100GB bandwidth/mês, builds ilimitados |
| **Render** | Free | 750h/mês, sleep após 15min inatividade |
| **MongoDB Atlas** | M0 | 512MB storage, 100 conexões |
| **Gemini API** | Free | 60 req/min, 1500 req/dia |

**Total: R$ 0/mês** ✅

### Quando Escalar (Paid Plans):

- **Vercel Pro:** $20/mês (sem limits, analytics)
- **Render Starter:** $7/mês (sem sleep, 1GB RAM)
- **MongoDB Atlas M10:** $0.08/hora (~$57/mês)
- **Gemini API:** Pay-as-you-go ($0.001/1K chars)

---

## 🚀 Deploy Rápido (TL;DR)

```bash
# 1. MongoDB Atlas
https://mongodb.com/cloud/atlas
→ Criar cluster free → Copiar connection string

# 2. Backend (Render)
https://render.com
→ New Web Service → GitHub → backend folder
→ Add env vars → Deploy

# 3. Frontend (Vercel)
cd frontend
vercel login
vercel --prod
→ Add env vars (VITE_API_URL, VITE_GEMINI_API_KEY)

# 4. Testar
https://sua-app.vercel.app
```

---

## 📚 Links Úteis

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
- **Gemini API:** https://ai.google.dev/docs

---

## 🎓 Próximos Passos

Após deploy inicial:

1. **Domínio Customizado:**
   - Vercel: Settings → Domains → Add `seudominio.com`
   - Render: Settings → Custom Domain

2. **SSL/HTTPS:** (Automático em Vercel e Render)

3. **Analytics:**
   - Vercel Analytics (integrado)
   - Google Analytics
   - PostHog

4. **Monitoring:**
   - Render: Built-in metrics
   - Sentry para error tracking
   - LogRocket para session replay

5. **CI/CD:**
   - GitHub Actions para testes automáticos
   - Deploy automático no push

---

**Versão:** 1.0
**Data:** 23/12/2024
**Autor:** SmartEditor Team
**Status:** ✅ Pronto para deploy
