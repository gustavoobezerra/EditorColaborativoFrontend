# 🚀 Guia de Instalação Rápida

## Instalação em 5 Minutos

### 1. Instalar MongoDB

**Windows:**
```bash
# Instale via Chocolatey
choco install mongodb

# Ou baixe: https://www.mongodb.com/try/download/community
```

**Linux/Mac:**
```bash
# Mac com Homebrew
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Iniciar MongoDB
mongod
```

### 2. Clonar e Configurar

```bash
# Clone o repositório
git clone <seu-repo>
cd collaborative-editor-complete

# Backend
cd backend
npm install
cp .env.example .env
# Edite .env e mude JWT_SECRET para uma string aleatória

# Frontend (em outro terminal)
cd ../frontend
npm install
cp .env.example .env
```

### 3. Executar

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 4. Acessar

Abra `http://localhost:5173` no navegador

## Comandos Úteis

```bash
# Instalar todas as dependências de uma vez
npm install --prefix backend && npm install --prefix frontend

# Rodar com Docker
docker-compose up

# Ver logs do MongoDB
tail -f /var/log/mongodb/mongod.log
```

## Troubleshooting Rápido

**MongoDB não inicia:**
```bash
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

**Porta 5000 em uso:**
- Mude PORT no backend/.env

**Porta 5173 em uso:**
- Mude em vite.config.js

## Teste Rápido

1. Crie uma conta
2. Crie um documento
3. Abra em duas abas
4. Digite em uma - verá aparecer na outra instantaneamente!

## Deploy Rápido

**Backend (Railway/Render):**
1. Conecte seu GitHub
2. Configure variável MONGODB_URI
3. Deploy automático

**Frontend (Vercel/Netlify):**
1. Conecte GitHub
2. Build command: `npm run build`
3. Output directory: `dist`
4. Configure VITE_API_URL

---

Qualquer problema: abra uma Issue no GitHub!
