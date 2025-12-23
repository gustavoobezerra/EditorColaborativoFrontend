import { Cloud, CloudOff, Loader2, Check } from 'lucide-react';

/**
 * SavingIndicator - Indicador inteligente de status de salvamento
 *
 * Estados:
 * - idle: Nenhuma ação
 * - saving: Salvando...
 * - saved: Salvo com sucesso
 * - error: Erro ao salvar
 */

const SavingIndicator = ({ status = 'idle', lastSaved = null }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
          text: 'Salvando...',
          textColor: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        };
      case 'saved':
        return {
          icon: <Check className="w-4 h-4 text-emerald-500" />,
          text: 'Salvo',
          textColor: 'text-emerald-600 dark:text-emerald-400',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        };
      case 'error':
        return {
          icon: <CloudOff className="w-4 h-4 text-red-500" />,
          text: 'Erro ao salvar',
          textColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
        };
      default:
        return {
          icon: <Cloud className="w-4 h-4 text-slate-400" />,
          text: 'Todas as alterações salvas',
          textColor: 'text-slate-600 dark:text-slate-400',
          bgColor: 'bg-slate-50 dark:bg-slate-800/50',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgColor} transition-all duration-300`}
    >
      {config.icon}
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.text}
      </span>
      {lastSaved && status === 'saved' && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          • {new Date(lastSaved).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      )}
    </div>
  );
};

export default SavingIndicator;
