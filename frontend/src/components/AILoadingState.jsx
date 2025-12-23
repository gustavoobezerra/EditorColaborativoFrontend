import { Sparkles, Loader2 } from 'lucide-react';

/**
 * AILoadingState - Componente de loading para operações de IA
 *
 * Variantes:
 * - inline: Loading pequeno inline
 * - skeleton: Skeleton loader para texto
 * - fullscreen: Overlay completo
 */

export const AILoadingInline = ({ text = 'Gerando...' }) => (
  <div className="flex items-center gap-2 text-primary-500">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span className="text-sm font-medium animate-pulse">{text}</span>
  </div>
);

export const AISkeletonLoader = ({ lines = 3 }) => (
  <div className="space-y-3 py-4">
    {[...Array(lines)].map((_, i) => (
      <div
        key={i}
        className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded animate-pulse"
        style={{
          width: i === lines - 1 ? '70%' : '100%',
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

export const AIThinkingDots = () => (
  <div className="flex items-center gap-2">
    <Sparkles className="w-4 h-4 text-primary-500" />
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-primary-500 rounded-full animate-ai-thinking" />
      <span
        className="w-2 h-2 bg-primary-500 rounded-full animate-ai-thinking"
        style={{ animationDelay: '0.2s' }}
      />
      <span
        className="w-2 h-2 bg-primary-500 rounded-full animate-ai-thinking"
        style={{ animationDelay: '0.4s' }}
      />
    </div>
  </div>
);

export const AIFullscreenLoading = ({ message = 'Processando com IA...' }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-magic max-w-sm mx-4">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {message}
          </h3>
          <AIThinkingDots />
        </div>
      </div>
    </div>
  </div>
);

const AILoadingState = {
  Inline: AILoadingInline,
  Skeleton: AISkeletonLoader,
  Thinking: AIThinkingDots,
  Fullscreen: AIFullscreenLoading,
};

export default AILoadingState;
