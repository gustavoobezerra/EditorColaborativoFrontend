import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, MessageCircle, Trash2 } from 'lucide-react';
import geminiService from '../services/gemini';

/**
 * AIChatPanel - Painel lateral de chat com IA
 *
 * Features:
 * - Chat contextual com o documento
 * - Interface estilo mensagens (bolhas)
 * - Auto-scroll para novas mensagens
 * - Animação de "thinking" durante geração
 * - Slide-in animation
 */

const AIChatPanel = ({ isOpen, onClose, documentContent = '' }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: '👋 Olá! Sou seu assistente de escrita com IA. Posso ajudar a melhorar, expandir ou revisar seu documento. Como posso ajudar?',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus no input quando abrir
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  /**
   * Envia mensagem para IA
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isThinking) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsThinking(true);

    try {
      // Chama serviço Gemini com contexto do documento
      const aiResponse = await geminiService.chat(inputMessage, documentContent);

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);

      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
        isError: true,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  /**
   * Limpa histórico de chat
   */
  const handleClearChat = () => {
    if (confirm('Deseja limpar todo o histórico de chat?')) {
      setMessages([
        {
          id: 1,
          role: 'assistant',
          content: '👋 Chat limpo! Como posso ajudar agora?',
          timestamp: new Date(),
        }
      ]);
    }
  };

  /**
   * Handler para Enter
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-primary">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Assistente IA</h2>
              <p className="text-xs text-white/80">
                {geminiService.isConfigured() ? 'Gemini Pro' : 'Modo Demo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Limpar chat"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : message.isError
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {message.role === 'assistant' && !message.isError && (
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3 h-3 text-primary-500" />
                    <span className="text-xs font-medium text-primary-500">AI</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-white/70' : 'text-slate-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-ai-thinking" />
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-ai-thinking" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-ai-thinking" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem... (Enter para enviar)"
              className="flex-1 resize-none rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none max-h-32"
              rows={2}
              disabled={isThinking}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isThinking}
              className="self-end px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              {isThinking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Status bar */}
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{messages.length} mensagens</span>
            </div>
            <div>
              {geminiService.isConfigured() ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Online
                </span>
              ) : (
                <span className="text-amber-500">Modo Demo</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatPanel;
