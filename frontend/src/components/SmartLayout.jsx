import { useState, useEffect } from 'react';
import {
  Layout, Menu, Share2, Cloud,
  ChevronLeft, FileText, Settings,
  Sparkles, Bot, X, Send, MoreHorizontal,
  Home, PlusCircle
} from 'lucide-react';

/**
 * SmartLayout - Layout Shell Premium
 *
 * Container estrutural que envolve o editor real.
 * NÃO gerencia o conteúdo do documento - apenas a estrutura visual.
 *
 * Props:
 * - children: O editor Quill real
 * - title: Título do documento
 * - onTitleChange: Callback para mudança de título
 * - onNavigate: Callback para navegação
 * - onlineUsers: Array de usuários online
 * - onShare: Callback para compartilhar
 * - onToggleAI: Callback para toggle do painel AI
 * - isAIPanelOpen: Estado do painel AI (controlado externamente)
 */

const SmartLayout = ({
  children,
  title = "Sem Título",
  onTitleChange,
  onNavigate,
  onlineUsers = [],
  onShare,
  onToggleAI,
  isAIPanelOpen = false,
  savingStatus = 'saved', // 'saving' | 'saved' | 'error'
  isDarkMode = false,
  onToggleDarkMode
}) => {
  // Estados de UI locais (apenas para controles visuais)
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`flex h-screen w-full transition-colors duration-300 overflow-hidden ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>

      {/* SIDEBAR MINIMALISTA */}
      <aside
        className={`
          flex flex-col border-r transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] shrink-0 z-20
          ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}
          ${isSidebarOpen ? 'w-60' : 'w-0 opacity-0 overflow-hidden'}
        `}
      >
        {/* Header da Sidebar */}
        <div className="h-12 flex items-center px-4 font-medium text-sm text-slate-500 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary-600 rounded flex items-center justify-center text-white font-bold text-xs">W</div>
            <span className="text-slate-900 dark:text-white font-semibold tracking-tight">Workspace</span>
          </div>
        </div>

        {/* Links de Navegação */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          <button
            onClick={() => onNavigate && onNavigate('/dashboard')}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <Home size={16} /> Início
          </button>
          <button
            onClick={() => onNavigate && onNavigate('/new')}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <PlusCircle size={16} /> Novo Documento
          </button>

          <div className="mt-6 mb-2 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Recentes</div>
          <div className="text-xs text-slate-400 px-2 py-4 text-center">
            Use o Dashboard para ver documentos
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-800">
          <button className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
            <Settings size={16} /> Configurações
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">

        {/* HEADER UNIFICADO (Estilo Google Docs) */}
        <header className={`h-14 flex items-center justify-between px-3 border-b shrink-0 z-10 gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
            </button>

            {/* Título e Status */}
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
                  className="bg-transparent font-medium text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 rounded px-1 truncate max-w-[300px]"
                  placeholder="Documento sem título"
                />
                <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                  savingStatus === 'saving'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : savingStatus === 'error'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}>
                  <Cloud size={10} /> {savingStatus === 'saving' ? 'Salvando...' : 'Salvo'}
                </span>
              </div>
            </div>
          </div>

          {/* Ações da Direita */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Avatares */}
            <div className="flex -space-x-1.5 mr-2">
              {onlineUsers.length > 0 ? (
                onlineUsers.slice(0, 3).map((u, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 text-white text-[10px] flex items-center justify-center font-bold transition-transform hover:scale-110"
                    style={{ backgroundColor: u.color || '#6366f1' }}
                    title={u.name}
                  >
                    {u.name?.[0] || 'U'}
                  </div>
                ))
              ) : (
                <div className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] flex items-center justify-center font-bold">
                  You
                </div>
              )}
            </div>

            <button
              onClick={onShare}
              className="h-7 px-3 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-full flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Share2 size={12} /> Compartilhar
            </button>

            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>

            <button
              onClick={onToggleAI}
              className={`p-1.5 rounded transition-all ${
                isAIPanelOpen
                  ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/30'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Assistente Gemini"
            >
              <Sparkles size={18} />
            </button>

            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Modo Escuro"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </header>

        {/* CANVAS CENTRAL (Foco no Documento) */}
        <main className="flex-1 overflow-hidden relative flex flex-row">

          {/* Scroll Area Central */}
          <div
            className="flex-1 overflow-y-auto h-full relative scroll-smooth flex justify-center bg-slate-100 dark:bg-slate-950 cursor-text"
          >
            {/* A "Folha de Papel" */}
            <div className="my-8 w-full max-w-[850px] min-h-[1056px] bg-white dark:bg-slate-800 shadow-paper border border-slate-200 dark:border-slate-700 transition-all duration-300 mx-4 lg:mx-auto">
              {/* SEU EDITOR REAL ENTRA AQUI */}
              <div className="min-h-full">
                {children}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default SmartLayout;
