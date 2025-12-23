# 🔧 Troubleshooting - SmartEditor

## 🐛 Problemas Comuns e Soluções

### 1. ❌ Editor fica "Carregando..." infinitamente

**Sintomas:**
- Texto "Carregando..." não desaparece
- Não consegue digitar no editor
- Cursor não aparece

**Causas Possíveis:**

#### A) Backend não está rodando
```bash
# Verificar se backend está ativo
curl http://localhost:5000/api/auth/me
```

**Solução:**
```bash
cd backend
npm run dev
# Aguarde: "Server running on port 5000"
```

#### B) Socket.IO não conectou
```bash
# Abra DevTools (F12) → Console
# Procure por erros de socket
```

**Solução Aplicada:**
- ✅ Fallback automático após 3s
- ✅ Editor habilita mesmo sem socket
- ✅ Conteúdo carrega via API REST

**Como funciona agora:**
```javascript
// Tenta carregar via Socket
socketService.on('load-document', content => {
  quill.setContents(content);
  quill.enable();
});

// Fallback após 3s
setTimeout(() => {
  if (!documentLoaded) {
    quill.setText(''); // Limpa "Carregando..."
    quill.enable();    // Habilita editor
  }
}, 3000);

// Carrega via API também
loadDocumentData(); // Habilita se tiver conteúdo
```

#### C) Erro de autenticação
```bash
# Console mostra: 401 Unauthorized
```

**Solução:**
1. Faça logout
2. Faça login novamente
3. Verifique se token JWT está válido

```javascript
// Limpar localStorage se necessário
localStorage.removeItem('auth-storage');
```

---

### 2. ❌ Barra de ferramentas duplicada

**Sintomas:**
- Duas barras do Quill aparecem
- Botões de formatação duplicados
- Layout quebrado

**Causas Possíveis:**

#### A) React StrictMode renderizando duas vezes
```jsx
// main.jsx
<React.StrictMode>  ← Causa dupla renderização em dev
  <App />
</React.StrictMode>
```

**Solução Aplicada:**
```javascript
// Editor.jsx
useEffect(() => {
  if (!quillRef.current || quill) return; // ← Previne duplicação

  const q = new Quill(quillRef.current, {...});
  setQuill(q);
}, []); // Apenas na montagem inicial
```

#### B) CSS conflitante

**Verificar no DevTools:**
```css
/* Deve ter apenas UMA toolbar */
.ql-toolbar.ql-snow {
  /* Seus estilos */
}
```

**Solução:**
- ✅ CSS específico para esconder duplicatas
- ✅ Guard clause no useEffect
- ✅ Cleanup correto no unmount

---

### 3. ❌ Magic Toolbar não aparece

**Sintomas:**
- Seleciona texto mas menu não abre
- Botões AI não funcionam

**Causas e Soluções:**

#### A) Seleção muito curta
```
Mínimo: 3 caracteres
Recomendado: 5+ palavras
```

#### B) Selecionou com teclado (Shift+Setas)
```
Solução: Use o mouse para selecionar
```

#### C) Componente não montado

**Verificar no console:**
```javascript
// Deve aparecer no DOM
document.querySelector('.magic-toolbar')
```

**Código de verificação:**
```jsx
// Editor.jsx - Deve estar presente
<MagicToolbar
  editorRef={quillRef}
  onTextTransform={handleTextTransform}
/>
```

---

### 4. ❌ AI Chat não responde

**Sintomas:**
- Mensagem enviada mas sem resposta
- Spinner fica rodando infinito

**Causas e Soluções:**

#### A) Modo Mock com erro

**Verificar .env:**
```env
VITE_USE_MOCK_AI=true  ← Deve ser exatamente 'true'
```

**Teste rápido:**
```javascript
// Console do navegador
import geminiService from './services/gemini';
console.log(geminiService.getStatus());
// Deve mostrar: { mode: 'mock', configured: false }
```

#### B) API Key inválida (modo real)

**Verificar:**
```env
VITE_GEMINI_API_KEY=AIza...  ← Deve começar com AIza
```

**Testar key:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=SUA_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

#### C) CORS ou bloqueio de rede

**DevTools → Network:**
```
Procure requisições para:
generativelanguage.googleapis.com

Status:
- 200 = OK
- 401 = Key inválida
- 403 = Quota excedida
- 429 = Rate limit
```

**Solução:**
```javascript
// Gemini tem limite free:
// 60 requisições/minuto
// Aguarde 1 minuto e tente novamente
```

---

### 5. ❌ Dark Mode não funciona

**Sintomas:**
- Botão clica mas tema não muda
- Cores ficam estranhas

**Verificar store:**
```javascript
// DevTools Console
import { useThemeStore } from './store';
console.log(useThemeStore.getState().theme);
// Deve ser: 'light' ou 'dark'
```

**Solução:**
```javascript
// Forçar tema via console
useThemeStore.getState().setTheme('dark');

// Ou limpar localStorage
localStorage.removeItem('theme-storage');
location.reload();
```

---

### 6. ❌ Ghost Text não aparece

**Sintomas:**
- AI Typing ativado mas sem sugestões
- Nada acontece ao parar de digitar

**Verificar:**

#### A) Feature está ativada?
```
Header → ⚡ AI Typing
Deve estar roxo/indigo (não cinza)
```

#### B) Cursor no final do texto?
```
Ghost só aparece se cursor estiver no fim
Use: Ctrl+End (Windows) ou Cmd+End (Mac)
```

#### C) Texto termina com ponto?
```javascript
// Ghost não aparece após frase completa:
"Esta é uma frase."  ← Não gera
"Esta é uma"         ← Gera ghost
```

#### D) Aguardou 800ms?
```
Para de digitar → Aguarda 1s → Ghost aparece
```

**Debug mode:**
```javascript
// GhostTextCompletion.jsx
// Linha 50 - Adicione console.log
const generateCompletion = async (currentText) => {
  console.log('Gerando ghost para:', currentText.slice(-50));
  // ...
};
```

---

### 7. ❌ Saving Indicator sempre em "Salvando..."

**Sintomas:**
- Fica com spinner azul infinito
- Nunca mostra "Salvo"

**Causas:**

#### A) Backend não responde
```bash
# Teste socket
curl http://localhost:5000/socket.io/?transport=polling
```

#### B) Loop infinito de save

**Verificar console:**
```
Se aparecer MUITAS vezes:
"Auto-saving document..."
```

**Solução:**
```javascript
// Editor.jsx - Já corrigido
setSavingStatus('saving');
socketService.saveDocument(id, content);
setSavingStatus('saved');

// Volta para idle após 2s
setTimeout(() => setSavingStatus('idle'), 2000);
```

---

### 8. ❌ Erro: "Cannot read property 'getText' of null"

**Sintomas:**
```
TypeError: Cannot read property 'getText' of null
  at AIChatPanel.jsx:50
```

**Causa:**
Quill não foi inicializado ainda

**Solução Aplicada:**
```javascript
// Usa optional chaining
documentContent={quill?.getText() || ''}  ← ✅ Correto
documentContent={quill.getText()}         ← ❌ Erro se null
```

---

## 🔍 Ferramentas de Debug

### 1. Verificar estado do Editor

**Console:**
```javascript
// Verificar Quill
window.quill = quillInstance; // Adicione no Editor.jsx

// Depois no console:
quill.getContents();  // Ver conteúdo
quill.getSelection(); // Ver seleção
quill.hasFocus();     // Ver se tem foco
```

### 2. Verificar Socket.IO

**Console:**
```javascript
// Backend deve mostrar:
// "New client connected: socket-id"

// Frontend deve mostrar:
// "Socket connected"
```

### 3. Verificar API Gemini

**Teste manual:**
```bash
# Substitua SUA_KEY
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=SUA_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Olá"}]}]}'

# Resposta esperada:
# { "candidates": [...] }
```

### 4. Limpar cache completo

**Passos:**
```bash
# 1. Limpar node_modules
cd frontend
rm -rf node_modules
npm install

# 2. Limpar build
rm -rf dist

# 3. Limpar browser
# DevTools → Application → Clear storage → Clear site data

# 4. Rebuild
npm run build
npm run dev
```

---

## 🚨 Erros Críticos

### Backend não inicia

**Erro:**
```
Error: Cannot find module 'express'
```

**Solução:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### MongoDB não conecta

**Erro:**
```
MongoNetworkError: connect ECONNREFUSED
```

**Solução:**
```bash
# Opção 1: Docker
docker-compose up -d

# Opção 2: MongoDB local
mongod --dbpath=/path/to/data

# Verificar .env
MONGODB_URI=mongodb://localhost:27017/collaborative-editor
```

### Port já em uso

**Erro:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solução:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Ou mude a porta no .env
PORT=5001
```

---

## ✅ Checklist de Diagnóstico

Quando algo não funciona, siga esta ordem:

### 1. Backend
- [ ] MongoDB está rodando?
- [ ] `npm run dev` sem erros?
- [ ] Porta 5000 acessível?
- [ ] `.env` configurado corretamente?

### 2. Frontend
- [ ] `npm run dev` sem erros?
- [ ] `.env` tem URLs corretas?
- [ ] Console sem erros (F12)?
- [ ] Network mostra requisições OK?

### 3. Features AI
- [ ] `VITE_USE_MOCK_AI=true` no `.env`?
- [ ] Componentes montados no DOM?
- [ ] Console sem erros de IA?
- [ ] Gemini API key válida (se modo real)?

### 4. Editor
- [ ] Quill inicializado (console.log)?
- [ ] Editor habilitado (não disabled)?
- [ ] Sem "Carregando..." preso?
- [ ] Uma toolbar apenas (não duplicada)?

---

## 📞 Suporte Adicional

### Logs úteis

**Adicione no Editor.jsx:**
```javascript
useEffect(() => {
  console.log('🔍 Debug:', {
    quill: !!quill,
    user: !!user,
    document: !!document,
    savingStatus,
    theme
  });
}, [quill, user, document, savingStatus, theme]);
```

### Documentação

- **FEATURES_AI.md** - Detalhes das features
- **INTEGRATION_STATUS.md** - Status completo
- **GHOST_TEXT_FEATURE.md** - Ghost Text específico
- **AI_USAGE_GUIDE.md** - Como usar

### Links Úteis

- Quill Issues: https://github.com/quilljs/quill/issues
- Socket.IO Docs: https://socket.io/docs/
- Gemini API: https://ai.google.dev/docs
- React DevTools: https://react.dev/learn/react-developer-tools

---

**Última atualização:** 23/12/2024
**Versão:** 2.2 com correções de bugs
**Status:** ✅ Problemas principais corrigidos
