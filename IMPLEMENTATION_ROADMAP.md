# CollabDocs - Roadmap de Implementação das Melhorias Estratégicas

Este documento detalha o progresso e próximos passos para transformar o CollabDocs em um concorrente de peso contra Google Docs e Notion.

---

## ✅ MELHORIAS JÁ IMPLEMENTADAS

### MELHORIA 1: Modo Offline Inteligente com Resolução de Conflitos ✓

**Status:** ✅ COMPLETO

**Implementado:**
- ✅ Serviço `offlineSync.js` usando Yjs (CRDT)
- ✅ Persistência offline com IndexedDB (`y-indexeddb`)
- ✅ Sincronização via WebSocket quando online (`y-websocket`)
- ✅ Binding manual Quill↔Yjs (compatível com Quill 1.3.7)
- ✅ Detecção automática de status de rede
- ✅ Componente `OfflineStatusIndicator` para feedback visual
- ✅ Integração no Editor principal

**Arquivos Criados:**
- `frontend/src/services/offlineSync.js` (340 linhas)
- `frontend/src/components/OfflineStatusIndicator.jsx` (120 linhas)

**Dependências Instaladas:**
- `yjs`, `y-indexeddb`, `y-protocols`, `y-websocket`, `quill-cursors`

**Como funciona:**
1. Usuário edita documento → Yjs aplica mudanças localmente
2. IndexedDB persiste dados (mesmo offline)
3. Quando online, WebSocket sincroniza com servidor
4. Conflitos são resolvidos automaticamente pelo algoritmo CRDT
5. Indicador visual mostra status: Offline/Syncing/Synced

---

### MELHORIA 2: Performance Ultra-Rápida (Anti-Notion) ✓

**Status:** ✅ COMPLETO

**Implementado:**
- ✅ Hook `useDebounce` para otimizar operações pesadas
- ✅ Hook `useIntersectionObserver` para detecção de viewport
- ✅ Componente `LazyImage` com lazy loading inteligente
- ✅ Infraestrutura de performance pronta

**Arquivos Criados:**
- `frontend/src/hooks/useDebounce.js`
- `frontend/src/hooks/useIntersectionObserver.js`
- `frontend/src/components/LazyImage.jsx`

**Dependências Instaladas:**
- `@tanstack/react-virtual`, `lodash.debounce`

**Próximos Passos (Opcional):**
- Aplicar virtualização em listas longas de documentos no Dashboard
- Implementar code-splitting com React.lazy para componentes grandes
- Adicionar service worker para cache de assets

---

## 🔨 MELHORIAS PENDENTES

### MELHORIA 3: IA Contextual Não-Intrusiva

**Objetivo:** Melhorar sistema de IA (Ghost Text) com debouncing e UX aprimorada

**Tarefas:**
1. **Aplicar debouncing no GhostTextCompletion:**
   ```javascript
   // Em GhostTextCompletion.jsx
   import { useDebounce } from '../hooks/useDebounce';

   const debouncedContent = useDebounce(currentText, 800); // Espera 800ms após parar de digitar

   useEffect(() => {
     if (debouncedContent) {
       fetchAISuggestion(debouncedContent);
     }
   }, [debouncedContent]);
   ```

2. **Melhorar feedback visual:**
   - Adicionar loading spinner discreto
   - Tooltip explicando como aceitar (Tab) ou rejeitar (Esc)
   - Configuração para ativar/desativar Ghost Text

3. **Otimizar requisições:**
   - Cancelar requisições pendentes ao digitar novamente
   - Cache de sugestões para contextos similares
   - Rate limiting (máx 1 req/segundo)

**Arquivos a Modificar:**
- `frontend/src/components/GhostTextCompletion.jsx`
- `frontend/src/components/MagicToolbar.jsx`
- `frontend/src/services/gemini.js`

---

### MELHORIA 4: Comentários com Threads e Resolução

**Objetivo:** Sistema completo de discussão inline com threads aninhadas

**Tarefas Backend:**

1. **Criar Model de Comentários:**
   ```javascript
   // backend/src/models/Comment.js
   const commentSchema = new Schema({
     document: { type: ObjectId, ref: 'Document', required: true },
     parent: { type: ObjectId, ref: 'Comment' }, // Para threads
     author: { type: ObjectId, ref: 'User', required: true },
     content: { type: String, required: true },
     selection: {
       index: Number,
       length: Number,
       text: String // Texto citado
     },
     status: { type: String, enum: ['open', 'resolved'], default: 'open' },
     reactions: [{
       user: { type: ObjectId, ref: 'User' },
       emoji: String
     }]
   }, { timestamps: true });
   ```

2. **Criar Rotas de Comentários:**
   - `POST /api/documents/:id/comments` - Criar comentário
   - `GET /api/documents/:id/comments` - Listar comentários
   - `POST /api/comments/:id/replies` - Responder (thread)
   - `PATCH /api/comments/:id/resolve` - Marcar como resolvido
   - `DELETE /api/comments/:id` - Deletar

3. **Atualizar Socket para comentários:**
   ```javascript
   // Eventos: comment-added, comment-resolved, comment-deleted
   ```

**Tarefas Frontend:**

1. **Componente CommentThread:**
   ```jsx
   <CommentThread
     comments={threadComments}
     documentId={id}
     onReply={handleReply}
     onResolve={handleResolve}
   />
   ```

2. **Integração com Quill:**
   - Highlight no texto comentado
   - Ícone inline ao lado do texto
   - Painel lateral com todos comentários

**Estimativa:** 6-8 horas de desenvolvimento

---

### MELHORIA 5: Templates Inteligentes e Personalizáveis

**Objetivo:** Galeria de templates reutilizáveis

**Tarefas Backend:**

1. **Criar Model Template:**
   ```javascript
   // backend/src/models/Template.js
   const templateSchema = new Schema({
     title: String,
     description: String,
     content: Object, // Quill Delta
     category: String, // 'Reunião', 'Relatório', 'Projeto'
     icon: String,
     author: { type: ObjectId, ref: 'User' },
     isPublic: Boolean,
     usageCount: { type: Number, default: 0 }
   });
   ```

2. **Rotas:**
   - `GET /api/templates` - Listar templates públicos + do usuário
   - `POST /api/templates` - Criar template
   - `POST /api/templates/:id/use` - Criar documento a partir do template
   - `DELETE /api/templates/:id` - Deletar

**Tarefas Frontend:**

1. **Página TemplateGallery:**
   ```jsx
   // frontend/src/pages/TemplateGallery.jsx
   - Grid de templates com preview
   - Filtro por categoria
   - Botão "Usar Template"
   ```

2. **Botão "Salvar como Template" no Editor:**
   - Modal para definir título, descrição, categoria
   - Opção de tornar público

3. **Integração no Dashboard:**
   - Botão "Criar do Template" ao lado de "Novo Documento"

**Templates Pré-Configurados:**
- 📋 Ata de Reunião
- 📊 Relatório Mensal
- 📝 Proposta de Projeto
- 🎯 OKRs Trimestrais
- 📄 Documento em Branco

**Estimativa:** 4-6 horas

---

### MELHORIA 6: Busca Avançada com Preview

**Objetivo:** Busca poderosa e rápida em todo conteúdo

**Tarefas Backend:**

1. **Configurar índice de texto no MongoDB:**
   ```javascript
   // Atualizar Document model
   documentSchema.index({ title: 'text', 'content.ops.insert': 'text', tags: 'text' });
   ```

2. **Endpoint de busca avançada:**
   ```javascript
   // GET /api/search?q=query&type=all|documents|templates
   - Busca full-text
   - Retorna trechos destacados (snippets)
   - Ordenação por relevância
   ```

**Tarefas Frontend:**

1. **Componente SearchBar global:**
   ```jsx
   // Substituir barra de busca atual no Dashboard
   <AdvancedSearchBar
     onSearch={handleSearch}
     onResultClick={handleNavigate}
   />
   ```

2. **Features:**
   - Autocomplete com MiniSearch (client-side para doc aberto)
   - Preview de resultados com highlight
   - Navegação por teclado (↑↓ Enter)
   - Filtros: tipo, data, colaborador

3. **Usar useDebounce:**
   ```javascript
   const debouncedQuery = useDebounce(searchQuery, 300);
   ```

**Estimativa:** 5-7 horas

---

### MELHORIA 7: Exportação Profissional Multi-Formato

**Objetivo:** Exportar para PDF, DOCX e Markdown

**Tarefas:**

1. **Instalar dependências:**
   ```bash
   npm install jspdf html2canvas docx turndown
   ```

2. **Criar serviço de exportação:**
   ```javascript
   // frontend/src/services/exportService.js

   export async function exportToPDF(title, content) {
     const html2canvas = await import('html2canvas');
     const jsPDF = await import('jspdf');
     // Converte Quill HTML → PDF
   }

   export function exportToDOCX(title, content) {
     const { Document, Packer, Paragraph } = require('docx');
     // Converte Quill Delta → DOCX
   }

   export function exportToMarkdown(content) {
     const TurndownService = require('turndown');
     // Converte Quill HTML → Markdown
   }
   ```

3. **Adicionar botão de exportação no Editor:**
   ```jsx
   <DropdownMenu>
     <MenuItem onClick={() => exportToPDF()}>Exportar PDF</MenuItem>
     <MenuItem onClick={() => exportToDOCX()}>Exportar DOCX</MenuItem>
     <MenuItem onClick={() => exportToMarkdown()}>Exportar Markdown</MenuItem>
   </DropdownMenu>
   ```

4. **Preservar formatação:**
   - Estilos inline
   - Imagens embutidas
   - Listas e tabelas
   - Cabeçalhos

**Estimativa:** 4-5 horas

---

### MELHORIA 8: Permissões Granulares e Segurança

**Objetivo:** Sistema robusto de controle de acesso com CASL

**Tarefas Backend:**

1. **Instalar CASL:**
   ```bash
   cd backend && npm install @casl/ability @casl/mongoose
   ```

2. **Definir Abilities:**
   ```javascript
   // backend/src/config/abilities.js
   import { AbilityBuilder, Ability } from '@casl/ability';

   export function defineAbilitiesFor(user, document) {
     const { can, cannot, build } = new AbilityBuilder(Ability);

     if (user._id.equals(document.owner)) {
       can('manage', 'Document'); // Owner pode tudo
     } else {
       const collab = document.collaborators.find(c => c.user.equals(user._id));
       if (collab) {
         if (collab.permission === 'edit') {
           can('update', 'Document');
           can('read', 'Document');
         } else {
           can('read', 'Document');
         }
       }
     }

     return build();
   }
   ```

3. **Middleware de autorização:**
   ```javascript
   // backend/src/middleware/authorize.js
   export function authorize(action, subject) {
     return async (req, res, next) => {
       const ability = defineAbilitiesFor(req.user, req.document);
       if (ability.can(action, subject)) {
         next();
       } else {
         res.status(403).json({ message: 'Forbidden' });
       }
     };
   }
   ```

4. **Features de segurança:**
   - Links com expiração (adicionar campo `shareLink.expiresAt`)
   - Limite de uso de links (contador)
   - Log de auditoria (nova collection `AuditLog`)
   - Permissões por ação: comment, share, export

**Estimativa:** 6-8 horas

---

### MELHORIA 9: Integração com Ferramentas Externas

**Objetivo:** Webhooks e API pública documentada

**Tarefas Backend:**

1. **Sistema de Webhooks:**
   ```javascript
   // backend/src/models/Webhook.js
   const webhookSchema = new Schema({
     user: { type: ObjectId, ref: 'User' },
     url: String,
     events: [String], // ['document.created', 'document.updated', 'comment.added']
     secret: String, // Para HMAC signature
     active: Boolean
   });

   // backend/src/services/webhookService.js
   export async function triggerWebhook(event, data) {
     const webhooks = await Webhook.find({ events: event, active: true });
     for (const webhook of webhooks) {
       axios.post(webhook.url, data, {
         headers: {
           'X-Webhook-Signature': generateSignature(data, webhook.secret)
         }
       });
     }
   }
   ```

2. **Documentar API com Swagger:**
   ```bash
   npm install swagger-ui-express swagger-jsdoc
   ```

   ```javascript
   // backend/src/swagger.js
   const swaggerSpec = {
     openapi: '3.0.0',
     info: {
       title: 'CollabDocs API',
       version: '1.0.0'
     },
     servers: [{ url: 'http://localhost:5000' }]
   };

   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
   ```

3. **API Keys para integrações:**
   - Gerar token de API separado do JWT
   - Rate limiting por key

**Tarefas Frontend:**

1. **Página de Integrações:**
   - Configurar webhooks
   - Gerar API keys
   - Ver logs de webhooks

**Estimativa:** 7-9 horas

---

### MELHORIA 10: Dashboard Analítico e Produtividade

**Objetivo:** Insights sobre hábitos de escrita

**Tarefas Backend:**

1. **Model de Analytics:**
   ```javascript
   // backend/src/models/Analytics.js
   const analyticsSchema = new Schema({
     user: { type: ObjectId, ref: 'User' },
     document: { type: ObjectId, ref: 'Document' },
     date: Date,
     wordsAdded: Number,
     sessionsCount: Number,
     totalTimeMs: Number,
     activityHeatmap: Map // { '2024-01-15': 1200 words }
   });
   ```

2. **Endpoint de métricas:**
   - `GET /api/analytics/summary?period=week|month|year`
   - Retorna: total words, avg per day, streak, etc.

**Tarefas Frontend:**

1. **Instalar Chart.js:**
   ```bash
   npm install chart.js react-chartjs-2
   ```

2. **Página AnalyticsDashboard:**
   ```jsx
   // frontend/src/pages/AnalyticsDashboard.jsx
   - Gráfico de atividade (Chart.js)
   - Streak de dias consecutivos
   - Meta de palavras (configurável)
   - Documentos mais editados
   - Readability score (text-readability)
   ```

3. **Métricas em tempo real:**
   - Contador de palavras no Editor
   - Timer de sessão
   - Progress bar de meta diária

**Estimativa:** 6-8 horas

---

## 📊 RESUMO DE PROGRESSO

| Melhoria | Status | Tempo Estimado Restante |
|----------|--------|-------------------------|
| 1. Modo Offline | ✅ COMPLETO | - |
| 2. Performance | ✅ COMPLETO | - |
| 3. IA Contextual | 🔨 Pendente | 2-3h |
| 4. Comentários | 🔨 Pendente | 6-8h |
| 5. Templates | 🔨 Pendente | 4-6h |
| 6. Busca Avançada | 🔨 Pendente | 5-7h |
| 7. Exportação | 🔨 Pendente | 4-5h |
| 8. Permissões | 🔨 Pendente | 6-8h |
| 9. Webhooks | 🔨 Pendente | 7-9h |
| 10. Analytics | 🔨 Pendente | 6-8h |

**Total Estimado:** 40-54 horas de desenvolvimento para completar todas as 8 melhorias restantes.

---

## 🚀 ORDEM RECOMENDADA DE IMPLEMENTAÇÃO

1. **MELHORIA 5: Templates** (Quick Win - 4-6h)
   - Impacto imediato na produtividade
   - Não depende de outras melhorias

2. **MELHORIA 7: Exportação** (Quick Win - 4-5h)
   - Feature muito solicitada
   - Aumenta competitividade

3. **MELHORIA 3: IA Contextual** (2-3h)
   - Melhora UX do sistema existente
   - Baixo esforço

4. **MELHORIA 6: Busca Avançada** (5-7h)
   - Essencial para bases grandes de documentos
   - Prepara infraestrutura para analytics

5. **MELHORIA 4: Comentários** (6-8h)
   - Colaboração avançada
   - Complementa sistema de compartilhamento

6. **MELHORIA 8: Permissões** (6-8h)
   - Segurança enterprise
   - Habilita casos de uso corporativos

7. **MELHORIA 10: Analytics** (6-8h)
   - Diferencial competitivo
   - Gamification de produtividade

8. **MELHORIA 9: Webhooks** (7-9h)
   - Integrações enterprise
   - Pode vir por último

---

## 📝 NOTAS TÉCNICAS

### Estrutura de Arquivos Criada

```
frontend/src/
├── hooks/
│   ├── useDebounce.js ✅
│   └── useIntersectionObserver.js ✅
├── services/
│   ├── offlineSync.js ✅
│   └── exportService.js (pendente)
└── components/
    ├── OfflineStatusIndicator.jsx ✅
    └── LazyImage.jsx ✅

backend/src/
├── models/
│   ├── Comment.js (pendente)
│   ├── Template.js (pendente)
│   ├── Webhook.js (pendente)
│   └── Analytics.js (pendente)
└── config/
    └── abilities.js (pendente)
```

### Dependências Instaladas

**Frontend:**
- ✅ yjs, y-indexeddb, y-protocols, y-websocket, quill-cursors
- ✅ @tanstack/react-virtual, lodash.debounce

**Pendentes:**
- jspdf, html2canvas, docx, turndown
- chart.js, react-chartjs-2
- text-readability, minisearch

**Backend:**
- Pendentes: @casl/ability, swagger-ui-express

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

1. Testar modo offline:
   ```bash
   # Desconectar internet e editar documento
   # Reconectar e verificar sincronização
   ```

2. Implementar MELHORIA 5 (Templates) seguindo este roadmap

3. Configurar CI/CD para deploy automático

4. Escrever testes E2E com Playwright/Cypress

---

**Documento criado em:** 2025-12-23
**Última atualização:** 2025-12-23
**Versão:** 1.0
