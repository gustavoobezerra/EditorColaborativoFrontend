# ⚡ Ghost Text / AI Typing - Autocompletar Inteligente

## 🎯 Visão Geral

A feature **Ghost Text Completion** (AI Typing) oferece sugestões de texto em tempo real enquanto você digita, similar ao GitHub Copilot, mas para escrita em linguagem natural.

---

## ✨ Como Funciona

### Comportamento Visual:

```
Você digita: "A inteligência artificial está revolucionando"

↓ (aguarda 800ms de inatividade)

Ghost aparece: "a forma como interagimos com tecnologia..." (texto cinza/itálico)

↓ (você decide)

Opção 1: Pressiona Tab    → Aceita sugestão completa
Opção 2: Pressiona Esc    → Rejeita sugestão
Opção 3: Continua digitando → Sugestão desaparece automaticamente
```

---

## 🎮 Controles

### Ativação/Desativação:

**Localização:** Botão no header (ao lado do botão AI)

```
┌─────────────────────────────────────────┐
│ [≡] Título   [☁️ Salvo]  [⚡ AI Typing] │
└─────────────────────────────────────────┘
```

**Estados:**
- 🟢 **Ativo:** Botão roxo/indigo com "AI Typing (Tab)"
- ⚫ **Inativo:** Botão cinza com "AI Typing"
- 🔵 **Gerando:** Spinner animado substituindo o raio

### Atalhos de Teclado:

| Tecla | Ação |
|-------|------|
| **Tab** | Aceita sugestão ghost |
| **Esc** | Rejeita sugestão ghost |
| Qualquer outra tecla | Limpa ghost e continua digitando |

---

## 🔧 Funcionamento Técnico

### 1. **Detecção de Inatividade (Debounce)**

```javascript
Usuário para de digitar
        ↓
   Aguarda 800ms
        ↓
  Ainda parado?
        ↓
    Sim → Gera sugestão
    Não → Cancela
```

**Por quê 800ms?**
- ⏱️ Tempo suficiente para pensar
- 🚫 Não interrompe fluxo de escrita
- ⚡ Rápido o suficiente para ser útil

### 2. **Contexto Limitado**

```javascript
Documento completo: 5000 caracteres
        ↓
Pega últimos: 500 caracteres
        ↓
Envia para Gemini: Prompt otimizado
        ↓
Recebe: Sugestão de 50-100 palavras
```

**Por quê limitar contexto?**
- 💰 Reduz custo de API
- ⚡ Resposta mais rápida
- 🎯 Sugestão mais relevante (contexto recente)

### 3. **Prompt Otimizado**

```javascript
const prompt = `Continue o texto de forma natural e concisa.
Retorne APENAS a continuação (máximo 50 palavras),
sem repetir o que já foi escrito:

"${context}"

Continuação:`;
```

**Configuração Gemini:**
```javascript
{
  temperature: 0.3,    // Mais determinístico
  maxTokens: 100,      // Limita tamanho
  stopSequences: ['\n\n', '.']  // Para em frases completas
}
```

### 4. **Renderização Ghost**

```javascript
// Cria elemento DOM overlay
<span class="ghost-completion" style="
  color: #94a3b8;      /* Cinza claro */
  opacity: 0.6;
  font-style: italic;
  pointer-events: none; /* Não interfere com cliques */
  user-select: none;    /* Não seleciona */
">
  sugestão aqui...
</span>
```

**Posicionamento:**
- 📍 Inserido no final do cursor
- 🎯 Usa `getBounds()` do Quill
- 🔄 Atualiza em tempo real

---

## 🎨 Feedback Visual

### 1. **Indicador no Canto Inferior Direito**

Quando ghost está ativo:

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│              ┌──────────────────┐   │
│              │ ⚡ Pressione Tab│   │
│              │   para aceitar   │   │
│              └──────────────────┘   │
└─────────────────────────────────────┘
```

**Animação:** Slide-up com fade-in

### 2. **Botão de Toggle**

```
Inativo:
┌──────────────┐
│ ⚡ AI Typing │
└──────────────┘
(cinza, sem badge)

Ativo:
┌────────────────────┐
│ ⚡ AI Typing (Tab) │
└────────────────────┘
(roxo/indigo, com badge)

Gerando:
┌──────────────┐
│ ⏳ AI Typing │
└──────────────┘
(spinner animado)
```

---

## 📊 Performance

### Latência Esperada:

| Modo | Tempo de Resposta |
|------|-------------------|
| Mock | 1.5s (simulado) |
| Real (Gemini) | 2-5s (variável) |

**Otimizações:**
- ✅ Debounce 800ms reduz chamadas desnecessárias
- ✅ Contexto limitado (500 chars) acelera processamento
- ✅ Temperature 0.3 gera respostas mais rápidas
- ✅ MaxTokens 100 limita tamanho da resposta

### Consumo de API:

**Estimativa por hora de escrita:**
- Usuário médio: 40 palavras/minuto
- Para de digitar: ~6x/minuto
- Sugestões geradas: ~360/hora

**Com Gemini Free Tier:**
- Limite: 60 requisições/minuto
- Uso real: ~6 requisições/minuto
- Margem: Ampla (90% de folga)

---

## 🎯 Quando Usar

### ✅ **Funciona Melhor Para:**

1. **Continuar Frases:**
   ```
   "O projeto consiste em"
   → "desenvolver uma plataforma web moderna..."
   ```

2. **Expandir Ideias:**
   ```
   "A IA pode ajudar na educação porque"
   → "permite personalizar o aprendizado para cada aluno..."
   ```

3. **Completar Parágrafos:**
   ```
   "Além disso, devemos considerar"
   → "o impacto ambiental dessas tecnologias..."
   ```

### ❌ **Não Funciona Bem Para:**

1. **Código de Programação:**
   - Gemini é otimizado para linguagem natural
   - Use GitHub Copilot para código

2. **Listas/Tabelas:**
   - Formatação complexa confunde o modelo
   - Melhor fazer manualmente

3. **Frases Muito Curtas (<5 palavras):**
   - Pouco contexto para sugestão relevante
   - Espere escrever mais

---

## 🔄 Workflow Recomendado

### Escrita Inicial (Rascunho):

```
1. [OFF] Desative AI Typing
   → Escreva livremente sem interrupções

2. Termine rascunho completo
   → Foco no fluxo de ideias

3. [ON] Ative AI Typing
   → Use para expandir seções curtas
```

### Expansão de Conteúdo:

```
1. Escreva tópico principal:
   "IA na saúde:"

2. [ON] Ative AI Typing

3. Digite início:
   "A inteligência artificial está transformando"

4. Aguarde sugestão
   → "o diagnóstico médico com precisão sem precedentes..."

5. Tab para aceitar

6. Continue expandindo com ajuda da IA
```

### Revisão e Refinamento:

```
1. Leia parágrafo existente

2. Identifique seções fracas

3. Delete final da seção

4. [ON] Ative AI Typing

5. Reescreva início
   → Aguarde sugestão diferente

6. Tab se melhor, Esc se não
```

---

## ⚙️ Configuração

### Variáveis de Ambiente:

```env
# .env
VITE_GEMINI_API_KEY=sua_chave_aqui
VITE_USE_MOCK_AI=false  # true para modo mock
```

### Parâmetros Customizáveis:

No arquivo `GhostTextCompletion.jsx`:

```javascript
// Tempo de espera antes de gerar (ms)
const DEBOUNCE_TIME = 800;  // Padrão: 800ms

// Tamanho do contexto enviado (caracteres)
const CONTEXT_LENGTH = 500;  // Padrão: 500

// Temperatura da IA (0-1)
const TEMPERATURE = 0.3;     // Padrão: 0.3 (determinístico)

// Máximo de tokens na resposta
const MAX_TOKENS = 100;      // Padrão: 100 (~50-75 palavras)
```

**Ajustes Recomendados:**

**Para respostas mais criativas:**
```javascript
temperature: 0.7,    // Mais variado
maxTokens: 150      // Sugestões mais longas
```

**Para respostas mais rápidas:**
```javascript
debounceTime: 600,   // Menos espera
contextLength: 300,  // Menos contexto
maxTokens: 50       // Sugestões mais curtas
```

---

## 🐛 Troubleshooting

### Problema: Ghost não aparece

**Possíveis causas:**

1. **AI Typing está desativado**
   ```
   Solução: Clique no botão "⚡ AI Typing" no header
   ```

2. **Cursor não está no final do texto**
   ```
   Solução: Ghost só aparece se cursor estiver no final
   Mova cursor para o fim (Ctrl+End)
   ```

3. **Texto termina com ponto final**
   ```
   Solução: Ghost não aparece em frases completas
   Continue escrevendo nova frase
   ```

4. **Menos de 800ms desde última tecla**
   ```
   Solução: Aguarde 1 segundo sem digitar
   ```

### Problema: Sugestões irrelevantes

**Possíveis causas:**

1. **Pouco contexto no documento**
   ```
   Solução: Escreva pelo menos 100 palavras antes
   ```

2. **Mudança abrupta de assunto**
   ```
   Solução: IA usa últimos 500 chars como contexto
   Se mudou de assunto, IA ainda está no anterior
   ```

3. **Modo Mock ativo**
   ```
   Solução: Ative modo real com API key
   Mock tem respostas genéricas
   ```

### Problema: Muito lento

**Possíveis causas:**

1. **Conexão internet lenta**
   ```
   Solução: API Gemini requer boa conexão
   Teste: ping ai.google.dev
   ```

2. **Contexto muito grande**
   ```
   Solução: Reduza CONTEXT_LENGTH para 300
   ```

3. **Servidor Gemini congestionado**
   ```
   Solução: Aguarde alguns minutos
   Ou use modo mock temporariamente
   ```

---

## 📊 Comparação com Outras Ferramentas

| Feature | SmartEditor Ghost | GitHub Copilot | Notion AI |
|---------|-------------------|----------------|-----------|
| Tipo | Texto natural | Código | Texto natural |
| Ativação | Automática | Automática | Manual (/) |
| Latência | 2-5s | 0.5-2s | 3-7s |
| Contexto | 500 chars | Arquivo inteiro | Página atual |
| Custo | Grátis (60/min) | $10/mês | $10/mês |
| Offline | ❌ Não | ❌ Não | ❌ Não |
| Customizável | ✅ Sim | ❌ Não | ❌ Não |

**Vantagens do SmartEditor:**
- ✅ Grátis com Gemini Free Tier
- ✅ Open source e customizável
- ✅ Modo mock para desenvolvimento
- ✅ Integrado ao editor

**Desvantagens:**
- ❌ Mais lento que Copilot
- ❌ Requer API key (ou usa mock)
- ❌ Não funciona offline

---

## 🚀 Melhorias Futuras

### Planejadas para v3.0:

1. **Cache de Sugestões:**
   ```
   Mesma frase → Mesma sugestão (sem API call)
   Economia: ~30% de requisições
   ```

2. **Sugestões Múltiplas:**
   ```
   Tab → Aceita primeira
   Alt+Tab → Mostra 3 opções
   ↑/↓ → Navega entre opções
   ```

3. **Smart Trigger:**
   ```
   Detecta: "por exemplo", "como", "porque"
   Gera: Sugestão automática sem esperar 800ms
   ```

4. **Histórico de Aceites:**
   ```
   IA aprende: Que sugestões você aceita
   Melhora: Sugestões futuras baseadas no seu estilo
   ```

5. **Inline Shortcuts:**
   ```
   /resumir → Resumo automático do parágrafo
   /expandir → Versão expandida
   /reescrever → Variação alternativa
   ```

---

## 📚 Recursos Adicionais

### Documentação:
- `INTEGRATION_STATUS.md` - Status completo
- `AI_USAGE_GUIDE.md` - Guia de uso geral
- `FEATURES_AI.md` - Detalhes técnicos

### Links Úteis:
- Gemini API: https://ai.google.dev/docs
- Quill Editor: https://quilljs.com/docs/api/
- GitHub Copilot (inspiração): https://github.com/features/copilot

---

## 💡 Dicas Avançadas

### 1. Workflow Híbrido (AI + Manual):

```
1. Escreva título e subtítulos manualmente
2. Ative AI Typing
3. Inicie cada seção com 2-3 palavras
4. Tab para expandir com IA
5. Revise e ajuste manualmente
6. Repita para próxima seção
```

### 2. Uso Seletivo:

```
Seções técnicas: [OFF] Escreva manualmente (precisão)
Seções narrativas: [ON] Use IA (fluidez)
Conclusões: [ON] IA ajuda a sintetizar
```

### 3. Combinar com Magic Toolbar:

```
1. Escreva rascunho com AI Typing
2. Selecione texto gerado
3. Magic Toolbar → Melhorar
4. Resultado: Texto polido e profissional
```

---

## ✅ Conclusão

**Ghost Text / AI Typing** é a **4ª feature de IA** do SmartEditor, oferecendo:

✅ Sugestões automáticas em tempo real
✅ Debounce inteligente (não interrompe)
✅ Integração perfeita com Quill
✅ Controles simples (Tab/Esc)
✅ Feedback visual claro
✅ Customizável via código

**Status:** ✅ **IMPLEMENTADO E FUNCIONAL**

**Build Status:** ✅ Passing (19.21s)

---

**Versão:** 2.2 Ghost Text Feature
**Data:** 23/12/2024
**Arquivo:** `frontend/src/components/GhostTextCompletion.jsx`
**Integração:** `frontend/src/pages/Editor.jsx` (linhas 312-316)
