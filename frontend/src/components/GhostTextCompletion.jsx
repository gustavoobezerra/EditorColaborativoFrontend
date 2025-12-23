import { useEffect, useRef, useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import geminiService from '../services/gemini';

/**
 * GhostTextCompletion - Autocompletar inline estilo GitHub Copilot
 *
 * Features:
 * - Detecta quando usuário para de digitar (debounce 800ms)
 * - Envia últimos ~500 caracteres para contexto
 * - Mostra sugestão em cinza (ghost text)
 * - Tab para aceitar, Esc para rejeitar
 * - Toggle on/off via botão
 */

const GhostTextCompletion = ({ quillInstance, isEnabled, onToggle }) => {
  const [ghostText, setGhostText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const debounceTimerRef = useRef(null);
  const lastTextRef = useRef('');
  const ghostElementRef = useRef(null);

  /**
   * Gera sugestão de completar texto
   */
  const generateCompletion = async (currentText) => {
    if (!isEnabled || !currentText.trim()) return;

    // Pega últimos 500 caracteres para contexto
    const context = currentText.slice(-500);

    // Não gera se terminou com ponto final (frase completa)
    if (context.trim().endsWith('.') || context.trim().endsWith('!') || context.trim().endsWith('?')) {
      return;
    }

    setIsGenerating(true);

    try {
      // Chama Gemini com prompt otimizado para completion
      const prompt = `Continue o texto de forma natural e concisa. Retorne APENAS a continuação (máximo 50 palavras), sem repetir o que já foi escrito:

"${context}"

Continuação:`;

      const completion = await geminiService.generateContent('continue', context, {
        temperature: 0.3,  // Mais determinístico
        maxTokens: 100,
        stopSequences: ['\n\n', '.']
      });

      // Remove texto já digitado se vier na resposta
      let cleanCompletion = completion.trim();

      // Se a IA repetiu o contexto, remove
      if (cleanCompletion.startsWith(context.slice(-50))) {
        cleanCompletion = cleanCompletion.slice(context.slice(-50).length);
      }

      // Limita a 100 caracteres
      if (cleanCompletion.length > 100) {
        cleanCompletion = cleanCompletion.slice(0, 100) + '...';
      }

      setGhostText(cleanCompletion);
    } catch (error) {
      console.error('Erro ao gerar completion:', error);
      setGhostText('');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Debounce - Aguarda usuário parar de digitar
   */
  useEffect(() => {
    if (!quillInstance || !isEnabled) return;

    const handleTextChange = () => {
      const currentText = quillInstance.getText();

      // Limpa ghost se usuário continuou digitando
      if (currentText !== lastTextRef.current) {
        setGhostText('');
        lastTextRef.current = currentText;
      }

      // Cancela timer anterior
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Aguarda 800ms de inatividade
      debounceTimerRef.current = setTimeout(() => {
        const text = quillInstance.getText();
        const cursorPosition = quillInstance.getSelection()?.index;

        // Só gera se cursor estiver no final do texto
        if (cursorPosition === text.length - 1) {
          generateCompletion(text);
        }
      }, 800);
    };

    quillInstance.on('text-change', handleTextChange);

    return () => {
      quillInstance.off('text-change', handleTextChange);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [quillInstance, isEnabled]);

  /**
   * Renderiza ghost text no Quill
   */
  useEffect(() => {
    if (!quillInstance || !ghostText) return;

    const editorElement = quillInstance.root;

    // Cria elemento ghost se não existir
    if (!ghostElementRef.current) {
      ghostElementRef.current = document.createElement('span');
      ghostElementRef.current.className = 'ghost-completion';
      ghostElementRef.current.style.cssText = `
        color: #94a3b8;
        opacity: 0.6;
        font-style: italic;
        pointer-events: none;
        user-select: none;
      `;
    }

    // Atualiza texto
    ghostElementRef.current.textContent = ghostText;

    // Insere no final do editor
    const range = quillInstance.getSelection();
    if (range) {
      const bounds = quillInstance.getBounds(range.index);
      ghostElementRef.current.style.position = 'absolute';
      ghostElementRef.current.style.left = `${bounds.left}px`;
      ghostElementRef.current.style.top = `${bounds.top}px`;

      if (!editorElement.contains(ghostElementRef.current)) {
        editorElement.appendChild(ghostElementRef.current);
      }
    }

    return () => {
      if (ghostElementRef.current && editorElement.contains(ghostElementRef.current)) {
        editorElement.removeChild(ghostElementRef.current);
      }
    };
  }, [quillInstance, ghostText]);

  /**
   * Aceitar sugestão (Tab)
   */
  const acceptGhost = () => {
    if (!ghostText || !quillInstance) return;

    const range = quillInstance.getSelection();
    if (range) {
      quillInstance.insertText(range.index, ghostText);
      quillInstance.setSelection(range.index + ghostText.length);
    }

    setGhostText('');
  };

  /**
   * Rejeitar sugestão (Esc)
   */
  const rejectGhost = () => {
    setGhostText('');
  };

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    if (!quillInstance) return;

    const handleKeyDown = (e) => {
      // Tab - Aceitar
      if (e.key === 'Tab' && ghostText) {
        e.preventDefault();
        acceptGhost();
      }

      // Esc - Rejeitar
      if (e.key === 'Escape' && ghostText) {
        e.preventDefault();
        rejectGhost();
      }

      // Qualquer outra tecla - Limpa ghost
      if (ghostText && !['Tab', 'Escape'].includes(e.key)) {
        setGhostText('');
      }
    };

    const editorElement = quillInstance.root;
    editorElement.addEventListener('keydown', handleKeyDown);

    return () => {
      editorElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [quillInstance, ghostText]);

  return (
    <>
      {/* Botão Toggle no Header */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          isEnabled
            ? 'bg-primary-500 text-white shadow-sm hover:bg-primary-600'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        title={isEnabled ? 'Desativar AI Typing' : 'Ativar AI Typing'}
      >
        {isGenerating ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Zap className="w-3 h-3" />
        )}
        AI Typing
        {isEnabled && <span className="text-[10px] opacity-75">(Tab)</span>}
      </button>

      {/* Indicador visual quando ghost está ativo */}
      {ghostText && isEnabled && (
        <div className="fixed bottom-4 right-4 bg-slate-900 dark:bg-slate-800 text-white px-3 py-2 rounded-lg shadow-lg text-xs flex items-center gap-2 animate-slide-up z-50">
          <Zap className="w-3 h-3 text-primary-400" />
          <span>Pressione <kbd className="px-1 py-0.5 bg-slate-700 rounded text-[10px]">Tab</kbd> para aceitar</span>
        </div>
      )}
    </>
  );
};

export default GhostTextCompletion;
