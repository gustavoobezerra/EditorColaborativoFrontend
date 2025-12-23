# 🚀 CollabDocs - Guia de Início Rápido

Este guia ajuda você a configurar, testar e começar a usar o CollabDocs com as novas melhorias implementadas.

---

## 📦 1. INSTALAÇÃO E CONFIGURAÇÃO

### Pré-requisitos

- Node.js 18+
- MongoDB 6+ (local ou Atlas)
- Git

### Passo 1: Instalar Dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Passo 2: Configurar Variáveis de Ambiente

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collabdocs
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your-gemini-api-key-optional
```

### Passo 3: Iniciar Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Acesse: **http://localhost:3000**

---

## ✅ 2. TESTANDO AS MELHORIAS IMPLEMENTADAS

### 🌐 TESTE: Modo Offline (MELHORIA 1)

**Cenário:** Verificar edição offline e sincronização automática

1. **Faça Login:**
   - Registre um usuário em `/register`
   - Faça login em `/login`

2. **Crie um Documento:**
   - Clique em "Novo Documento"
   - Digite um título: "Teste Offline"

3. **Entre em Modo Offline:**
   - Abra DevTools (F12)
   - Network tab → Throttling → Offline
   - **OU** desative Wi-Fi/Ethernet

4. **Edite o Documento:**
   - Digite: "Este texto foi escrito offline!"
   - Observe o indicador no canto inferior direito:
     - 🟡 "Offline mode - changes saved locally"

5. **Verifique IndexedDB:**
   - DevTools → Application → IndexedDB
   - Procure por: `collab-doc-{documentId}`
   - Suas mudanças estão persistidas localmente!

6. **Volte Online:**
   - Network → Online
   - **OU** reative internet
   - Observe o indicador:
     - 🔵 "Back online - syncing changes..."
     - 🟢 "All changes synced"

7. **Confirme Sincronização:**
   - Abra o documento em outro navegador/aba
   - Suas mudanças offline devem aparecer!

**✅ Sucesso:** Documento editável offline + sync automática

---

### ⚡ TESTE: Performance com Debouncing (MELHORIA 2)

**Cenário:** Busca ultra-rápida sem lag

1. **Crie Vários Documentos:**
   - Dashboard → "Novo Documento" (pelo menos 10 vezes)
   - Títulos variados: "Reunião", "Relatório", "Projeto", etc.

2. **Teste a Busca:**
   - No Dashboard, use a barra de busca
   - Digite rapidamente: "rel"
   - **Observe:** Sem lag, resultado aparece 300ms após parar de digitar

3. **Compare (Simulação de Lag):**
   - Abra DevTools → Console
   - Execute:
     ```javascript
     // Simula busca sem debounce (pior caso)
     const input = document.querySelector('input[type="text"]');
     let count = 0;
     input.addEventListener('input', () => {
       count++;
       console.log(`Busca chamada ${count} vezes`);
     });
     ```
   - Digite "relatório" rapidamente
   - **Veja:** Chamaria API ~10 vezes (ineficiente!)

4. **Com Debounce (Implementado):**
   - Mesmo teste acima
   - **Resultado:** Apenas 1 chamada após parar de digitar
   - **Economia:** 90% menos requisições!

**✅ Sucesso:** Busca responsiva e eficiente

---

### 🖼️ TESTE: Lazy Loading de Imagens (MELHORIA 2)

**Cenário:** Imagens carregam sob demanda

1. **Adicione Imagens ao Documento:**
   - Editor → Toolbar → Ícone de imagem
   - Insira URLs de imagens grandes (ex: Unsplash)

2. **Abra Network Tab:**
   - DevTools → Network → Img filter
   - Recarregue a página

3. **Role para Baixo:**
   - **Observe:** Imagens carregam apenas quando entram no viewport
   - Requisições aparecem conforme você rola

4. **Compare com Eager Loading:**
   - Eager: Todas 10 imagens (10MB) carregam ao abrir
   - Lazy: Apenas visíveis (~2MB inicialmente)
   - **Economia:** ~70-80% de banda

**✅ Sucesso:** Carregamento inteligente de imagens

---

## 🧪 3. TESTES DE INTEGRAÇÃO

### Teste Multi-Usuário (Colaboração em Tempo Real)

**Requer:** 2 navegadores ou janelas anônimas

**Usuário 1:**
```bash
# Navegador 1
1. Faça login como user1@test.com
2. Crie documento "Collab Test"
3. Compartilhe → Gerar link com permissão "Editar"
4. Copie o link
```

**Usuário 2:**
```bash
# Navegador 2 (aba anônima)
1. Acesse o link compartilhado
2. Faça login (ou use sem login se permitido)
3. Ambos editam simultaneamente
```

**Observe:**
- ✅ Mudanças aparecem em tempo real
- ✅ Cursores de cada usuário visíveis
- ✅ Sem conflitos (Yjs resolve automaticamente)
- ✅ Se um ficar offline, mudanças sincronizam ao reconectar

---

### Teste de Persistência Offline

**Cenário:** Fechar navegador offline e reabrir

1. **Offline:**
   - Desconecte internet
   - Edite documento: "Teste de persistência"
   - **Feche o navegador** (não apenas a aba)

2. **Reabra (ainda offline):**
   - Abra navegador novamente
   - Navegue para o documento
   - **Observe:** Suas mudanças offline estão lá!

3. **Reconecte:**
   - Ative internet
   - Mudanças sincronizam com servidor

**✅ Sucesso:** IndexedDB persistiu dados entre sessões

---

## 🐛 4. TROUBLESHOOTING

### Problema: "Offline sync not working"

**Solução:**
1. Verifique console do navegador:
   ```javascript
   // Deve aparecer:
   "📦 IndexedDB synced - offline data loaded"
   "🔗 Quill manually bound to Yjs document"
   ```

2. Se erro de CORS:
   ```javascript
   // backend/.env
   CORS_ORIGIN=http://localhost:3000
   ```

3. Limpe IndexedDB:
   - DevTools → Application → IndexedDB
   - Delete all databases
   - Reload

---

### Problema: "Changes not syncing"

**Checklist:**
- ✅ Backend está rodando? (http://localhost:5000)
- ✅ Socket.IO conectado? (Console: "WebSocket status: connected")
- ✅ Documento aberto no banco? (MongoDB Compass)
- ✅ Firewall bloqueando WebSocket?

**Debug:**
```javascript
// No console do navegador
offlineSyncService.getStatus()
// Deve retornar:
{
  online: true,
  synced: true,
  connected: true,
  documentId: "..."
}
```

---

### Problema: "Performance still slow"

**Verificações:**
1. Componentes estão usando `React.memo`?
2. Listas grandes com virtualização?
3. Debounce ativado em inputs?

**Profiling:**
```javascript
// DevTools → Performance → Record
// Identifique componentes com re-renders excessivos
```

---

## 📊 5. MÉTRICAS DE SUCESSO

### KPIs das Melhorias

| Métrica | Meta | Como Medir |
|---------|------|------------|
| Tempo offline | Ilimitado | Deixe offline por horas |
| Sincronização | < 2s | Observe indicador |
| Conflitos | 0 | Edite simultaneamente (2 users) |
| Busca (1000 docs) | < 100ms | DevTools → Performance |
| Imagens lazy-loaded | > 70% economia | Network tab |

---

## 🎯 6. PRÓXIMAS FEATURES (Roadmap)

Consulte `IMPLEMENTATION_ROADMAP.md` para:

1. **Templates** (4-6h)
2. **Exportação PDF/DOCX** (4-5h)
3. **IA Contextual** (2-3h)
4. **Busca Avançada** (5-7h)
5. **Comentários com Threads** (6-8h)
6. **Permissões Granulares** (6-8h)
7. **Analytics Dashboard** (6-8h)
8. **Webhooks** (7-9h)

---

## 📚 7. RECURSOS ADICIONAIS

### Documentação Completa

- **`IMPLEMENTATION_ROADMAP.md`** - Guia de implementação das 8 melhorias restantes
- **`IMPROVEMENTS_SUMMARY.md`** - Resumo técnico das melhorias implementadas
- **`README.md`** - Documentação geral do projeto

### Código de Exemplo

**Usar Debounce em Novo Componente:**
```javascript
import { useDebounce } from '../hooks/useDebounce';

function MyComponent() {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    // Chama API apenas após 500ms de inatividade
    fetchData(debouncedValue);
  }, [debouncedValue]);

  return <input onChange={e => setValue(e.target.value)} />;
}
```

**Lazy Load de Componente:**
```javascript
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

function LazyComponent() {
  const { ref, hasIntersected } = useIntersectionObserver();

  return (
    <div ref={ref}>
      {hasIntersected && <ExpensiveChart />}
    </div>
  );
}
```

---

## 🚀 8. DEPLOY EM PRODUÇÃO

### Checklist Pré-Deploy

- [ ] `.env` configurado com valores de produção
- [ ] MongoDB Atlas configurado (não localhost)
- [ ] CORS_ORIGIN apontando para domínio real
- [ ] JWT_SECRET forte e único
- [ ] Build de produção testado:
  ```bash
  npm run build
  npm run preview
  ```

### Plataformas Recomendadas

**Frontend:**
- Vercel (grátis, deploy automático)
- Netlify (grátis)

**Backend:**
- Render (grátis, suporta WebSocket)
- Railway (fácil deploy)
- Heroku (pago)

**Database:**
- MongoDB Atlas (grátis até 512MB)

---

## 🎓 9. APRENDIZADOS-CHAVE

### Para Desenvolvedores

1. **CRDTs > Operational Transformation**
   - Yjs é mais simples e robusto que OT
   - Zero configuração de servidor

2. **Performance Incremental**
   - Debounce inputs
   - Lazy load tudo que não é crítico
   - Virtualizar listas > 100 itens

3. **Offline-First = Melhor UX**
   - Salve local primeiro
   - Sincronize em background
   - Sempre mostre status

---

## 📞 10. SUPORTE

### Problemas Comuns

1. **"Cannot connect to MongoDB"**
   - MongoDB rodando? `mongod --version`
   - URI correta? `mongodb://localhost:27017`

2. **"CORS error"**
   - Backend: `CORS_ORIGIN=http://localhost:3000`
   - Frontend: `VITE_API_URL=http://localhost:5000`

3. **"Socket not connecting"**
   - Backend rodando?
   - Firewall bloqueando porta 5000?

---

## ✨ PARABÉNS!

Você agora tem um editor colaborativo com:
- ✅ Edição offline (melhor que muitos concorrentes)
- ✅ Performance ultra-rápida
- ✅ Sincronização sem conflitos
- ✅ Infraestrutura escalável

**Próximo passo:** Implemente as 8 melhorias restantes seguindo o `IMPLEMENTATION_ROADMAP.md`!

---

**Última atualização:** 2025-12-23
**Versão:** 1.0
**Status:** 🟢 Pronto para Produção
