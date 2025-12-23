# 🚀 Guia de Deploy no Render - Editor Colaborativo

**Autor:** Gustavo Bezerra  
**Data:** Dezembro 2025

## 📋 Visão Geral

Este guia resolve o problema de **dependência circular** entre backend e frontend, hospedando **tudo no Render**.

**Por que Render?**
- ✅ Suporta WebSockets (Socket.IO) - essencial para colaboração em tempo real
- ✅ Plano gratuito para backend e frontend
- ✅ Deploy automático via GitHub
- ✅ Resolve dependência circular com facilidade

---

## 🎯 Passo a Passo

### Passo 1: Preparar o Repositório

Antes de fazer deploy, você precisa atualizar alguns arquivos no seu repositório.

#### 1.1 Atualizar `render.yaml` na raiz

Copie o arquivo `render.yaml` fornecido para a **raiz** do seu repositório:

```yaml
# Feito por Gustavo Bezerra
services:
  - type: web
    name: smarteditor-backend
    runtime: node
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRE
        value: 7d
      - key: CORS_ORIGIN
        sync: false

  - type: web
    name: smarteditor-frontend
    runtime: static
    rootDir: frontend
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    envVars:
      - key: VITE_API_URL
        sync: false
      - key: VITE_SOCKET_URL
        sync: false
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

#### 1.2 Atualizar `backend/src/server.js`

Substitua pelo arquivo `server.js` fornecido para suportar múltiplas origens CORS.

#### 1.3 Atualizar `frontend/src/services/api.js`

Substitua pelo arquivo `api.js` fornecido para suportar URLs dinâmicas.

#### 1.4 Atualizar `frontend/src/services/socket.js`

Substitua pelo arquivo `socket.js` fornecido para suportar URLs dinâmicas.

---

### Passo 2: Deploy no Render

#### 2.1 Criar Conta no Render

1. Acesse: https://render.com/
2. Clique em "Get Started for Free"
3. **Recomendado:** Faça login com GitHub para facilitar a conexão

#### 2.2 Conectar Repositório

1. No Dashboard, clique em **"New +"**
2. Selecione **"Blueprint"**
3. Conecte seu repositório GitHub: `gustavoobezerra/EditorColaborativoFrontend`
4. O Render detectará automaticamente o `render.yaml`

#### 2.3 Configurar Variáveis de Ambiente

**Para o Backend (`smarteditor-backend`):**

| Variável | Valor |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://gustavodeobezerra:raou142536@cluster0.1ljoyfg.mongodb.net/collaborative-editor?retryWrites=true&w=majority&appName=Cluster0` |
| `CORS_ORIGIN` | (deixe vazio por enquanto, configurar depois) |

**Para o Frontend (`smarteditor-frontend`):**

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | (deixe vazio por enquanto, configurar depois) |
| `VITE_SOCKET_URL` | (deixe vazio por enquanto, configurar depois) |

#### 2.4 Fazer Deploy Inicial

1. Clique em **"Apply"** para iniciar o deploy
2. Aguarde ambos os serviços ficarem **"Live"**
3. Anote as URLs geradas:
   - Backend: `https://smarteditor-backend-xxxx.onrender.com`
   - Frontend: `https://smarteditor-frontend-xxxx.onrender.com`

---

### Passo 3: Resolver Dependência Circular

Agora que você tem as URLs, configure as variáveis de ambiente:

#### 3.1 Configurar Backend

1. Vá em **Dashboard → smarteditor-backend → Environment**
2. Adicione/Atualize:
   - `CORS_ORIGIN`: `https://smarteditor-frontend-xxxx.onrender.com`
3. Clique em **"Save Changes"**
4. O serviço será reiniciado automaticamente

#### 3.2 Configurar Frontend

1. Vá em **Dashboard → smarteditor-frontend → Environment**
2. Adicione/Atualize:
   - `VITE_API_URL`: `https://smarteditor-backend-xxxx.onrender.com`
   - `VITE_SOCKET_URL`: `https://smarteditor-backend-xxxx.onrender.com`
3. Clique em **"Save Changes"**
4. O serviço será reconstruído automaticamente

---

### Passo 4: Testar

1. Acesse a URL do frontend: `https://smarteditor-frontend-xxxx.onrender.com`
2. Faça login com:
   - **Email:** `gustavo@teste.com`
   - **Senha:** `senha123`
3. Teste a criação e edição de documentos
4. Abra em duas abas para testar colaboração em tempo real

---

## 🔧 Troubleshooting

### Erro: "CORS Policy"

**Problema:** Frontend não consegue acessar backend

**Solução:**
1. Verifique se `CORS_ORIGIN` no backend está correto
2. A URL deve ser **exatamente** igual (com https://, sem barra final)
3. Reinicie o backend após alterar

### Erro: "Socket.IO Connection Failed"

**Problema:** WebSocket não conecta

**Solução:**
1. Verifique se `VITE_SOCKET_URL` está correto
2. Certifique-se que o backend está rodando
3. Verifique os logs do backend no Render

### Erro: "MongoDB Connection Failed"

**Problema:** Backend não conecta no MongoDB

**Solução:**
1. Verifique a `MONGODB_URI` no backend
2. No MongoDB Atlas, vá em **Network Access**
3. Adicione `0.0.0.0/0` para permitir qualquer IP

### Backend "Sleeping"

**Problema:** Render free tier coloca serviços para dormir após 15min de inatividade

**Solução:**
- Primeira requisição pode demorar ~30s para "acordar"
- Para evitar, considere upgrade para plano pago ($7/mês)
- Ou use um serviço de ping como UptimeRobot

---

## 💰 Custos

| Serviço | Plano | Limite |
|---------|-------|--------|
| Render Backend | Free | 750h/mês, sleep após 15min |
| Render Frontend | Free | 100GB bandwidth/mês |
| MongoDB Atlas | M0 Free | 512MB storage |

**Total: R$ 0/mês** ✅

---

## 📝 Checklist Final

- [ ] `render.yaml` na raiz do repositório
- [ ] `server.js` atualizado com CORS flexível
- [ ] `api.js` atualizado com URL dinâmica
- [ ] `socket.js` atualizado com URL dinâmica
- [ ] Deploy do backend funcionando
- [ ] Deploy do frontend funcionando
- [ ] `CORS_ORIGIN` configurado no backend
- [ ] `VITE_API_URL` configurado no frontend
- [ ] `VITE_SOCKET_URL` configurado no frontend
- [ ] Login funcionando
- [ ] Colaboração em tempo real funcionando

---

## 🎓 Próximos Passos

1. **Domínio Customizado:**
   - Render Dashboard → Service → Settings → Custom Domains
   
2. **Monitoramento:**
   - Render tem logs integrados
   - Considere adicionar Sentry para erros

3. **CI/CD:**
   - Deploy automático já está configurado via GitHub
   - Push para `main` = deploy automático

---

**Desenvolvido por Gustavo Bezerra - Dezembro 2025**
