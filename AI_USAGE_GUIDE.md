# 🤖 Guia de Uso - Funcionalidades AI do SmartEditor

## 🎯 Overview Rápido

O SmartEditor possui **3 formas principais** de interagir com a IA do Gemini:

1. **✨ Magic Toolbar** - Menu ao selecionar texto
2. **💬 AI Chat** - Conversa contextual
3. **🔮 Auto-features** - Saving inteligente, sugestões

---

## 1. ✨ Magic Toolbar (Menu Flutuante)

### Como Usar:

**Passo a Passo:**
```
1. Escreva algum texto no editor
   Exemplo: "O cachorro correu rápido"

2. Selecione o texto com o mouse
   [O cachorro correu rápido]

3. Menu flutuante aparece automaticamente
   ┌─────────────────────────────┐
   │ ✨ Melhorar | 📝 Resumir | 🌐 Traduzir │
   └─────────────────────────────┘

4. Clique na ação desejada

5. Aguarde processamento (1-3s)
   💫 Gerando...

6. Texto é substituído automaticamente
   "O cão se deslocou com velocidade"
```

### Ações Disponíveis:

#### ✨ **Melhorar Escrita**
- **O que faz:** Reescreve texto com melhor clareza, gramática e impacto
- **Exemplo:**
  ```
  Antes: "a gente foi la ontem"
  Depois: "Nós fomos lá ontem."
  ```

#### 📝 **Resumir**
- **O que faz:** Cria resumo conciso mantendo pontos principais
- **Exemplo:**
  ```
  Antes: [3 parágrafos explicando IA]
  Depois: "Resumo: IA é a capacidade de máquinas aprenderem..."
  ```

#### 🌐 **Traduzir**
- **O que faz:** Traduz texto para inglês mantendo contexto
- **Exemplo:**
  ```
  Antes: "Olá, como vai?"
  Depois: "Hello, how are you?"
  ```

### Dicas:

✅ **Funciona melhor com:**
- Frases completas (5-100 palavras)
- Parágrafos curtos
- Texto em português

❌ **Evite:**
- Selecionar texto muito longo (>500 palavras)
- Código de programação
- Apenas números ou símbolos

---

## 2. 💬 AI Chat Panel (Conversa Contextual)

### Como Usar:

**Passo a Passo:**
```
1. Clique no botão ✨ no header
   [Header] ← ✨ AI

2. Painel desliza da direita
   ┌─────────────────┐
   │ 🤖 Gemini AI   │
   │ ─────────────── │
   │ 👋 Olá! Como   │
   │    posso       │
   │    ajudar?     │
   │ ─────────────── │
   │ [Digite aqui]  │
   └─────────────────┘

3. Digite sua pergunta
   "Como posso melhorar este texto?"

4. Pressione Enter ou clique ➤

5. Aguarde resposta (2-5s)
   💬 Digitando...

6. Leia a resposta contextual
```

### Exemplos de Perguntas:

#### 📊 **Análise do Documento:**
```
Você: "Resuma este documento em 3 frases"
IA: "Este documento trata de... Os pontos principais são... Conclusão:"

Você: "Qual o tom deste texto?"
IA: "O tom é formal e profissional, adequado para..."

Você: "Há erros gramaticais?"
IA: "Identifiquei 2 erros: [lista]"
```

#### ✍️ **Ajuda para Escrever:**
```
Você: "Como posso começar uma introdução sobre IA?"
IA: "Você pode começar com: 'Inteligência Artificial representa...'"

Você: "Sugira 3 títulos para este documento"
IA: "1. A Revolução da IA\n2. IA Explicada\n3. Futuro Inteligente"

Você: "Expanda este parágrafo"
IA: [Versão expandida com mais detalhes]
```

#### 🎯 **Ideias e Brainstorm:**
```
Você: "Dê ideias para conclusão"
IA: "Você pode concluir destacando: [3 opções]"

Você: "O que mais posso escrever sobre este tema?"
IA: "Você poderia explorar: [sugestões]"
```

### Features do Chat:

✅ **Histórico de Conversas:**
- Todas mensagens são salvas na sessão
- Scroll automático para última mensagem
- Timestamps em cada mensagem

✅ **Contexto do Documento:**
- IA "lê" o documento inteiro
- Respostas baseadas no conteúdo
- Entende sobre o que você escreveu

✅ **Controles:**
- 🗑️ Limpar chat (botão no topo)
- ✕ Fechar painel
- Enter para enviar
- Shift+Enter para quebra de linha

---

## 3. 🔮 Auto-Features (Inteligência Passiva)

### 💾 Smart Saving Indicator

**Localização:** Header (ao lado do título)

**Estados:**
```
🔵 Salvando...  ← Editando documento
✅ Salvo        ← Salvo com sucesso (mostra hora)
❌ Erro         ← Falha ao salvar
☁️ Sincronizado ← Tudo ok
```

**Como funciona:**
- Auto-save a cada 2 segundos
- Feedback visual instantâneo
- Nunca perde dados

### 👥 Usuários Online

**Localização:** Header (direita)

**O que mostra:**
```
[A][B][+2]  ← Avatares de usuários
            ← Máximo 3 visíveis
            ← Hover para ver nome
```

### 🌙 Dark Mode

**Toggle:** Botão "..." no header

**Transições:**
- Todas cores mudam suavemente (300ms)
- Sem flash branco
- Memória: Lembra preferência

---

## 🎓 Workflows Práticos

### Workflow 1: Escrever Artigo com IA

```
1. Digite rascunho livre
   "ia é importante pq ajuda muito"

2. Selecione primeira frase
   Magic Toolbar → ✨ Melhorar
   → "Inteligência Artificial é crucial..."

3. Selecione parágrafo completo
   Magic Toolbar → 📝 Resumir
   → "Resumo: IA transforma indústrias..."

4. Abra AI Chat
   "Dê 3 ideias para o próximo parágrafo"
   → [Recebe sugestões]

5. Continue escrevendo com sugestões

6. Revise final com Magic Toolbar
```

### Workflow 2: Traduzir Documento

```
1. Escreva em português
   "Este é meu documento sobre tecnologia..."

2. Selecione tudo (Ctrl+A)

3. Magic Toolbar → 🌐 Traduzir
   → "This is my document about technology..."

4. Use AI Chat para revisar
   "Há erros de tradução?"
   → [IA analisa e corrige]
```

### Workflow 3: Resumir Texto Longo

```
1. Cole texto longo (ex: artigo 500 palavras)

2. Selecione seções importantes

3. Magic Toolbar → 📝 Resumir cada seção
   → 5 resumos parciais

4. AI Chat: "Una esses resumos em um único"
   → [Resumo executivo completo]
```

---

## ⚙️ Configurações

### Modo Mock (Padrão):

**Como está configurado:**
```env
VITE_USE_MOCK_AI=true
VITE_GEMINI_API_KEY=  # Vazio
```

**Comportamento:**
- ✅ Todas features funcionam
- ✅ Respostas simuladas realistas
- ✅ Delay artificial (1.5s) para UX
- ❌ Respostas não usam IA real

**Quando usar:**
- Desenvolvimento
- Demos
- Testes de interface
- Sem API key disponível

### Modo Real (Gemini Pro):

**Como configurar:**

1. **Obter API Key:**
   ```
   https://makersuite.google.com/app/apikey
   ```

2. **Editar .env:**
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...sua_chave
   VITE_USE_MOCK_AI=false
   ```

3. **Reiniciar servidor:**
   ```bash
   npm run dev
   ```

**Comportamento:**
- ✅ Respostas reais do Gemini Pro
- ✅ Qualidade superior
- ✅ Criatividade e precisão
- ⏱️ Latência real (2-5s)

**Quando usar:**
- Produção
- Uso real
- Melhor qualidade
- API key disponível

---

## 🐛 Troubleshooting

### Magic Toolbar não aparece:

**Problema:** Seleciono texto mas menu não abre

**Soluções:**
1. ✅ Selecione com mouse (não teclado)
2. ✅ Selecione pelo menos 3 caracteres
3. ✅ Certifique-se que está no editor (não no título)
4. ✅ Aguarde 100ms após seleção

### AI Chat não responde:

**Problema:** Envio mensagem mas não recebo resposta

**Soluções:**
1. ✅ Verifique console do navegador (F12)
2. ✅ Modo mock ativo? (deve funcionar sempre)
3. ✅ Modo real? Verifique API key no .env
4. ✅ Aguarde até 5s (latência da API)

### Texto não substitui após Magic Toolbar:

**Problema:** Clico "Melhorar" mas texto não muda

**Soluções:**
1. ✅ Aguarde o loading terminar (💫)
2. ✅ Verifique se seleção ainda está ativa
3. ✅ Tente selecionar novamente
4. ✅ Verifique console para erros

### API Key não funciona:

**Problema:** Configurei key mas ainda usa mock

**Soluções:**
1. ✅ Certifique-se que .env tem `VITE_USE_MOCK_AI=false`
2. ✅ Reinicie servidor (npm run dev)
3. ✅ Limpe cache (Ctrl+Shift+R)
4. ✅ Verifique se key está válida (Google AI Studio)

---

## 📊 Limites e Best Practices

### Limites da API Gemini (Modo Real):

| Recurso | Limite Gratuito |
|---------|----------------|
| Requisições/minuto | 60 |
| Tokens/requisição | 30,000 |
| Requisições/dia | ~1,500 |

**Dica:** Use modo mock para desenvolvimento, real para produção.

### Best Practices:

✅ **Faça:**
- Selecione textos específicos (não documento inteiro)
- Use chat para perguntas conceituais
- Use magic toolbar para edições pontuais
- Revise sempre o resultado da IA

❌ **Evite:**
- Processar >1000 palavras de uma vez
- Fazer mesma pergunta repetidamente
- Confiar 100% sem revisar
- Usar em dados sensíveis (sem validação)

---

## 🎯 Atalhos de Teclado (Futuros)

**Planejados para próxima versão:**

```
Ctrl+Shift+M  → Abrir Magic Toolbar
Ctrl+Shift+C  → Abrir AI Chat
Ctrl+Shift+I  → Melhorar texto selecionado
Ctrl+Shift+S  → Resumir texto selecionado
Ctrl+Shift+T  → Traduzir texto selecionado
```

---

## 📚 Recursos Adicionais

### Documentação Completa:
- `FEATURES_AI.md` - Detalhes técnicos
- `INTEGRATION_STATUS.md` - Status de implementação
- `QUICKSTART.md` - Início rápido
- `BUGFIX_LAYOUT.md` - Correções aplicadas

### Links Úteis:
- Google AI Studio: https://aistudio.google.com/
- Gemini API Docs: https://ai.google.dev/docs
- Tailwind CSS: https://tailwindcss.com/
- Quill Editor: https://quilljs.com/

---

## 💡 Dicas Avançadas

### 1. Combinar Features:

**Exemplo: Revisar e Melhorar**
```
1. AI Chat: "Quais partes estão confusas?"
2. IA indica parágrafos
3. Selecione cada parágrafo
4. Magic Toolbar → Melhorar
5. AI Chat: "Ficou melhor agora?"
```

### 2. Workflow de Tradução:

**Exemplo: PT → EN → Revisar**
```
1. Escreva em português
2. Magic Toolbar → Traduzir (toda seleção)
3. AI Chat: "Está natural em inglês?"
4. IA sugere ajustes
5. Aplica manualmente
```

### 3. Brainstorm com IA:

**Exemplo: Gerar Ideias**
```
1. Escreva tema: "Impacto da IA na educação"
2. AI Chat: "Dê 10 subtópicos"
3. IA lista: 1) Personalização, 2) Acessibilidade...
4. Escolha 3 favoritos
5. AI Chat: "Expanda subtópico 1"
6. IA gera parágrafo inicial
7. Use Magic Toolbar para refinar
```

---

## 🎉 Conclusão

O SmartEditor oferece **3 maneiras poderosas** de usar IA:

1. **Magic Toolbar** → Ações rápidas (Melhorar, Resumir, Traduzir)
2. **AI Chat** → Conversa e análise contextual
3. **Auto-features** → Feedback inteligente (Saving, Status)

**Status:** ✅ Todas funcionais (mock + real)

**Próximo passo:** Obtenha API key e ative modo real para Gemini Pro! 🚀

---

**Última atualização:** 23/12/2024
**Versão:** 2.1 Full AI Integration
**Modo recomendado:** Mock (dev) / Real (prod)
