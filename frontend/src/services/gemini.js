/**
 * GeminiService - Integração com Google Gemini AI
 *
 * Este serviço oferece integração com a API do Google Gemini para features de IA generativa.
 * Suporta tanto mock (desenvolvimento) quanto chamadas reais à API.
 *
 * Funcionalidades:
 * - Reescrita e melhoria de texto
 * - Resumo de conteúdo
 * - Tradução
 * - Chat contextual com o documento
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const USE_MOCK = !GEMINI_API_KEY || import.meta.env.VITE_USE_MOCK_AI === 'true';

// URL da API do Gemini
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Simula delay de rede para mocks
 */
const mockDelay = (ms = 1500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Respostas mock para diferentes tipos de requisições
 */
const mockResponses = {
  rewrite: (text) => {
    const variations = [
      `Versão aprimorada: ${text.charAt(0).toUpperCase() + text.slice(1)}. Este texto foi refinado para melhor clareza e impacto.`,
      `Reformulação profissional: ${text}. Agora com estrutura mais elegante e vocabulário enriquecido.`,
      `Texto otimizado: ${text.split(' ').map(w => w.length > 4 ? w : w).join(' ')}. Mantendo a essência com melhor fluidez.`
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  },

  summarize: (text) => {
    const words = text.split(' ');
    const summary = words.length > 20
      ? `Resumo: Este conteúdo aborda ${words.slice(0, 5).join(' ')}... Principais pontos incluem aspectos fundamentais apresentados de forma clara e objetiva.`
      : `Resumo conciso: ${text}`;
    return summary;
  },

  translate: (text, targetLang = 'en') => {
    const translations = {
      en: `Translation to English: ${text} (Professionally translated maintaining context and tone)`,
      es: `Traducción al español: ${text} (Traducido profesionalmente manteniendo el contexto)`,
      fr: `Traduction en français: ${text} (Traduit professionnellement en préservant le sens)`
    };
    return translations[targetLang] || translations.en;
  },

  chat: (message, documentContext) => {
    const responses = [
      `Considerando o conteúdo do seu documento, posso ajudar com "${message}". O contexto atual sugere que você está trabalhando em um projeto interessante.`,
      `Entendo sua questão: "${message}". Baseado no documento, posso oferecer insights relevantes e sugestões práticas.`,
      `Ótima pergunta! Sobre "${message}", aqui está minha análise considerando o contexto do documento...`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  },

  continue: (text) => {
    const continuations = [
      ` Além disso, é importante considerar que essa abordagem oferece benefícios significativos para o desenvolvimento do projeto.`,
      ` Neste contexto, podemos expandir essa ideia explorando suas aplicações práticas e impacto potencial.`,
      ` Vale ressaltar que essa perspectiva abre novas possibilidades para análise e implementação futura.`
    ];
    return text + continuations[Math.floor(Math.random() * continuations.length)];
  }
};

/**
 * Formata prompt para a API do Gemini
 */
const formatPrompt = (type, content, options = {}) => {
  const prompts = {
    rewrite: `Reescreva o seguinte texto de forma mais clara, profissional e impactante, mantendo o significado original:\n\n"${content}"`,

    summarize: `Crie um resumo conciso e objetivo do seguinte texto, destacando os pontos principais:\n\n"${content}"`,

    translate: `Traduza o seguinte texto para ${options.targetLang || 'inglês'} de forma profissional e natural:\n\n"${content}"`,

    chat: `Você é um assistente de escrita inteligente. O usuário está trabalhando no seguinte documento:\n\n---\n${options.documentContext || 'Sem contexto'}\n---\n\nUsuário pergunta: ${content}\n\nResponda de forma útil, relevante e considerando o contexto do documento.`,

    continue: `Continue o seguinte texto de forma natural e coerente:\n\n"${content}"`
  };

  return prompts[type] || content;
};

/**
 * Chama a API real do Gemini
 */
const callGeminiAPI = async (prompt) => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    // Extrai o texto da resposta do Gemini
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error('Invalid response format from Gemini API');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Falha ao comunicar com o Gemini AI. Verifique sua conexão e API key.');
  }
};

/**
 * Classe principal do serviço Gemini
 */
class GeminiService {
  constructor() {
    this.isUsingMock = USE_MOCK;
    this.apiKey = GEMINI_API_KEY;
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured() {
    return !this.isUsingMock;
  }

  /**
   * Método genérico para gerar conteúdo
   * @param {string} type - Tipo de geração (rewrite, summarize, translate, chat, continue)
   * @param {string} content - Conteúdo de entrada
   * @param {object} options - Opções adicionais
   * @returns {Promise<string>} - Conteúdo gerado
   */
  async generateContent(type, content, options = {}) {
    if (!content || content.trim() === '') {
      throw new Error('Conteúdo não pode estar vazio');
    }

    // Modo mock
    if (this.isUsingMock) {
      await mockDelay(options.delay || 1500);

      switch (type) {
        case 'rewrite':
          return mockResponses.rewrite(content);
        case 'summarize':
          return mockResponses.summarize(content);
        case 'translate':
          return mockResponses.translate(content, options.targetLang);
        case 'chat':
          return mockResponses.chat(content, options.documentContext);
        case 'continue':
          return mockResponses.continue(content);
        default:
          return `Mock response for: ${content}`;
      }
    }

    // Modo real - chama a API do Gemini
    const prompt = formatPrompt(type, content, options);
    return await callGeminiAPI(prompt);
  }

  /**
   * Reescreve/melhora um texto
   */
  async rewrite(text) {
    return this.generateContent('rewrite', text);
  }

  /**
   * Cria um resumo do texto
   */
  async summarize(text) {
    return this.generateContent('summarize', text);
  }

  /**
   * Traduz texto para outro idioma
   */
  async translate(text, targetLang = 'en') {
    return this.generateContent('translate', text, { targetLang });
  }

  /**
   * Chat contextual com o documento
   */
  async chat(message, documentContext = '') {
    return this.generateContent('chat', message, { documentContext });
  }

  /**
   * Continua escrevendo a partir do texto fornecido
   */
  async continueWriting(text) {
    return this.generateContent('continue', text);
  }

  /**
   * Retorna status do serviço
   */
  getStatus() {
    return {
      configured: this.isConfigured(),
      mode: this.isUsingMock ? 'mock' : 'real',
      apiKey: this.isConfigured() ? '***' + this.apiKey?.slice(-4) : null
    };
  }
}

// Exporta instância singleton
const geminiService = new GeminiService();
export default geminiService;
