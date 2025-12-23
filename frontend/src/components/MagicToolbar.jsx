import { useState, useEffect, useRef } from 'react';
import { Sparkles, FileText, Languages, Loader2 } from 'lucide-react';
import geminiService from '../services/gemini';

/**
 * MagicToolbar - Menu flutuante que aparece ao selecionar texto
 *
 * Features:
 * - Aparece próximo à seleção de texto
 * - Animação suave de entrada (magic-appear)
 * - Ações: Melhorar, Resumir, Traduzir
 * - Integração com GeminiService
 * - Feedback visual de loading
 */

const MagicToolbar = ({ editorRef, onTextTransform }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const toolbarRef = useRef(null);

  // Detecta seleção de texto
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text.length > 0) {
        setSelectedText(text);

        // Calcula posição do menu flutuante
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setPosition({
          top: rect.top - 60 + window.scrollY,
          left: rect.left + rect.width / 2 + window.scrollX,
        });

        setIsVisible(true);
      } else {
        setIsVisible(false);
        setActiveAction(null);
      }
    };

    // Listener para seleção de texto
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, []);

  // Fecha toolbar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setIsVisible(false);
        setActiveAction(null);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  /**
   * Executa ação de IA
   */
  const handleAction = async (action) => {
    setIsLoading(true);
    setActiveAction(action);

    try {
      let result;

      switch (action) {
        case 'rewrite':
          result = await geminiService.rewrite(selectedText);
          break;
        case 'summarize':
          result = await geminiService.summarize(selectedText);
          break;
        case 'translate':
          result = await geminiService.translate(selectedText, 'en');
          break;
        default:
          result = selectedText;
      }

      // Callback para substituir texto no editor
      if (onTextTransform) {
        onTextTransform(result);
      }

      setIsVisible(false);
      setActiveAction(null);
    } catch (error) {
      console.error('Erro ao processar ação:', error);
      alert('Erro ao processar texto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 animate-magic-appear"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-magic border border-slate-200 dark:border-slate-700 p-2 flex items-center gap-1">
        {/* Botão: Melhorar Escrita */}
        <button
          onClick={() => handleAction('rewrite')}
          disabled={isLoading}
          className="group relative flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          title="Melhorar escrita"
        >
          {isLoading && activeAction === 'rewrite' ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
          ) : (
            <Sparkles className="w-4 h-4 text-primary-500 group-hover:text-primary-600" />
          )}
          <span className="text-sm font-medium whitespace-nowrap">Melhorar</span>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Reescrever com IA
          </div>
        </button>

        {/* Divisor */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-600" />

        {/* Botão: Resumir */}
        <button
          onClick={() => handleAction('summarize')}
          disabled={isLoading}
          className="group relative flex items-center gap-2 px-3 py-2 rounded-md hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          title="Resumir seleção"
        >
          {isLoading && activeAction === 'summarize' ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          ) : (
            <FileText className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600" />
          )}
          <span className="text-sm font-medium whitespace-nowrap">Resumir</span>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Criar resumo
          </div>
        </button>

        {/* Divisor */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-600" />

        {/* Botão: Traduzir */}
        <button
          onClick={() => handleAction('translate')}
          disabled={isLoading}
          className="group relative flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          title="Traduzir para inglês"
        >
          {isLoading && activeAction === 'translate' ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
            <Languages className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
          )}
          <span className="text-sm font-medium whitespace-nowrap">Traduzir</span>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Traduzir para inglês
          </div>
        </button>
      </div>

      {/* Seta indicadora */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
        <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-slate-800" />
      </div>
    </div>
  );
};

export default MagicToolbar;
