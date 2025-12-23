# ⚡ Deploy Rápido - 15 minutos

## 🎯 Objetivo

Colocar SmartEditor online em 15 minutos usando serviços gratuitos.

---

## 📋 Pré-requisitos

- [ ] Conta GitHub
- [ ] Código commitado no Git
- [ ] Node.js instalado localmente (para testes)

---

## 🚀 Passo a Passo

### 1️⃣ MongoDB Atlas (5 minutos)

```bash
1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Sign up com Google
3. Create a deployment:
   - M0 FREE
   - Provider: AWS
   - Region: São Paulo (sa-east-1)
   - Cluster Name: SmartEditor
4. Security Quickstart:
   - Username: admin
   - Password: [ANOTE A SENHA!]
   - Add Current IP Address
5. Finish and Close
6. Database → Connect:
   - Connect your application
   - Driver: Node.js
   - Copie connection string:

   mongodb+srv://admin:<password>@smarteditor.xxxxx.mongodb.net/?retryWrites=true&w=majority

   - Substitua <password> pela senha real
   - Adicione /smarteditor antes do ?:

   mongodb+srv://admin:SENHA@smarteditor.xxxxx.mongodb.net/smarteditor?retryWrites=true&w=majority
```

✅ **Connection String pronta!**

---

### 2️⃣ Backend no Render (5 minutos)

```bash
1. Acesse: https://render.com/
2. Sign up com GitHub
3. Dashboard → New → Web Service
4. Connect repository (autorize GitHub)
5. Configurar:
   Name: smarteditor-backend
   Environment: Node
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start

6. Advanced → Add Environment Variable:

   NODE_ENV = production
   PORT = 10000
   MONGODB_URI = [Cole connection string do Atlas]
   JWT_SECRET = [Clique "Generate" ou cole senha forte]
   JWT_EXPIRE = 7d
   CORS_ORIGIN = * (temporário, vamos atualizar)

7. Create Web Service
```

⏳ **Aguarde ~5 minutos para deploy...**

✅ **Backend URL:** `https://smarteditor-backend-xxxxx.onrender.com`

**Teste:**
```bash
curl https://smarteditor-backend-xxxxx.onrender.com/api/health
# Deve retornar: {"status":"healthy"}
```

---

### 3️⃣ Frontend na Vercel (5 minutos)

#### Opção A: Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel login
vercel

# Seguir prompts:
# - Set up and deploy? Yes
# - Project name? smarteditor
# - Directory? ./
# - Override settings? No

# Adicionar env vars:
vercel env add VITE_API_URL production
# Digite: https://smarteditor-backend-xxxxx.onrender.com

vercel env add VITE_SOCKET_URL production
# Digite: https://smarteditor-backend-xxxxx.onrender.com

vercel env add VITE_GEMINI_API_KEY production
# Digite: sua_chave_gemini (ou deixe vazio para usar mock)

vercel env add VITE_USE_MOCK_AI production
# Digite: false (se tiver API key) ou true (para modo mock)

# Deploy para produção
vercel --prod
```

#### Opção B: Vercel Dashboard

```bash
1. Acesse: https://vercel.com/
2. Sign up com GitHub
3. Add New → Project
4. Import Git Repository → Selecione seu repositório
5. Configure:
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist

6. Environment Variables:
   VITE_API_URL = https://smarteditor-backend-xxxxx.onrender.com
   VITE_SOCKET_URL = https://smarteditor-backend-xxxxx.onrender.com
   VITE_GEMINI_API_KEY = [sua chave ou deixe vazio]
   VITE_USE_MOCK_AI = true (ou false se tiver API key)

7. Deploy
```

⏳ **Aguarde ~3 minutos para build...**

✅ **Frontend URL:** `https://smarteditor-xxxxx.vercel.app`

---

### 4️⃣ Atualizar CORS (1 minuto)

```bash
1. Render Dashboard → smarteditor-backend
2. Environment → Edit CORS_ORIGIN
3. Mudar de * para: https://smarteditor-xxxxx.vercel.app
4. Save Changes (vai redeploy automático)
```

---

## ✅ Teste Final

Acesse: `https://smarteditor-xxxxx.vercel.app`

**Testar:**
- [ ] Página carrega sem erros
- [ ] Criar conta
- [ ] Login funciona
- [ ] Criar documento
- [ ] Editar texto
- [ ] Magic Toolbar (selecionar texto)
- [ ] AI Chat (abrir painel direito)
- [ ] Ghost Text (ativar AI Typing)
- [ ] Dark Mode
- [ ] Salvar automático

---

## 🎉 Pronto!

Seu app está online em:
- **Frontend:** https://smarteditor-xxxxx.vercel.app
- **Backend:** https://smarteditor-backend-xxxxx.onrender.com
- **Database:** MongoDB Atlas

---

## 🔧 Se algo deu errado

### Erro: "Failed to fetch"

**Console do navegador:**
```
Access to fetch at 'https://backend...' from origin 'https://frontend...' has been blocked by CORS policy
```

**Solução:**
```bash
# Render → Environment → CORS_ORIGIN
# Certifique-se que está EXATAMENTE igual a URL da Vercel (sem / no final)
CORS_ORIGIN=https://smarteditor-xxxxx.vercel.app
```

### Erro: "MongoDB Connection Failed"

**Render Logs:**
```
MongooseError: Could not connect to MongoDB
```

**Solução:**
```bash
# MongoDB Atlas → Network Access
# Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

# Ou adicione IPs do Render:
# Render → Service → Connect → Outbound IPs
```

### Erro: Build failed na Vercel

**Vercel Logs:**
```
Error: Command "npm run build" exited with 1
```

**Solução:**
```bash
# Teste build local:
cd frontend
npm run build

# Se funcionar local mas falha na Vercel:
# Vercel Dashboard → Settings → Environment Variables
# Adicione todas variáveis VITE_*
```

---

## 💡 Próximos Passos

1. **Domínio Customizado:**
   - Vercel: Settings → Domains → `seudominio.com`

2. **Obter Gemini API Key:**
   - https://makersuite.google.com/app/apikey
   - Copiar e adicionar no Vercel: `VITE_GEMINI_API_KEY`
   - Mudar `VITE_USE_MOCK_AI=false`
   - Redeploy: `vercel --prod`

3. **Monitoring:**
   - Render: Built-in metrics (CPU, Memory, Requests)
   - Vercel: Analytics → Enable

4. **Backup:**
   - MongoDB Atlas: Backup automático (7 dias no free tier)

---

## 📊 Limites Free Tier

| Serviço | Limite | O que acontece? |
|---------|--------|-----------------|
| Render Free | Sleep após 15min inatividade | Primeiro acesso demora ~30s |
| Vercel Hobby | 100GB bandwidth/mês | Suficiente para ~10K usuários/mês |
| MongoDB M0 | 512MB storage | ~500 documentos com conteúdo rico |
| Gemini Free | 60 req/min | 1 usuário fazendo ~30 ações AI/min |

**Recomendação:** Comece no free tier, escale quando necessário.

---

**Tempo total:** ~15 minutos ⚡
**Custo:** R$ 0/mês 💰
**Status:** ✅ Production-Ready
