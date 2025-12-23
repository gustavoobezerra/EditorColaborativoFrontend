import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import {
  ArrowLeft, Users, Save, Share2, Clock, Star, MoreHorizontal,
  Copy, Check, Link2, Mail, Eye, Edit3, History, X, ChevronDown,
  Moon, Sun, Sparkles, MessageCircle
} from 'lucide-react';
import socketService from '../services/socket';
import {
  getDocument, updateDocument, generateShareLink, disableShareLink,
  addCollaborator, removeCollaborator, getVersions, restoreVersion, toggleStar
} from '../services/api';
import { useAuthStore, useDocumentStore, useThemeStore } from '../store';

// Novos componentes AI
import MagicToolbar from '../components/MagicToolbar';
import AIChatPanel from '../components/AIChatPanel';
import SavingIndicator from '../components/SavingIndicator';
import SmartLayout from '../components/SmartLayout';
import GhostTextCompletion from '../components/GhostTextCompletion';

const SAVE_INTERVAL = 2000;
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ['link', 'image', 'code-block'],
  ['clean']
];

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showShareModal, setShowShareModal] = useState(searchParams.get('share') === 'true');
  const [showVersions, setShowVersions] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorPermission, setCollaboratorPermission] = useState('view');
  const [versions, setVersions] = useState([]);
  const [document, setDocument] = useState(null);
  const [starred, setStarred] = useState(false);

  // Novos estados para features AI
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [savingStatus, setSavingStatus] = useState('idle'); // idle, saving, saved, error
  const [ghostTextEnabled, setGhostTextEnabled] = useState(false); // AI Typing

  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useThemeStore();
  const { activeUsers, setActiveUsers, setCurrentDocument } = useDocumentStore();

  // Inicializar Quill (apenas uma vez)
  useEffect(() => {
    if (!quillRef.current || quill) return; // Previne duplicação

    console.log('Inicializando Quill...');

    const q = new Quill(quillRef.current, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS },
      placeholder: 'Comece a escrever...'
    });

    q.disable();
    q.setText('Carregando...');
    setQuill(q);

    return () => {
      if (q) {
        q.off('text-change');
      }
    };
  }, []); // Apenas na montagem inicial

  // Conectar ao Socket e carregar documento
  useEffect(() => {
    if (!quill || !user) return;

    let documentLoaded = false;

    socketService.connect();
    socketService.joinDocument(id, user);

    socketService.on('load-document', (content) => {
      documentLoaded = true;
      quill.setContents(content);
      quill.enable();
    });

    socketService.on('receive-changes', (delta) => {
      quill.updateContents(delta);
    });

    socketService.on('users-update', (users) => {
      setActiveUsers(users);
    });

    // Carregar dados do documento via API
    loadDocumentData();

    // Fallback: Se após 3s não carregou via socket, habilita editor
    const fallbackTimer = setTimeout(() => {
      if (!documentLoaded && quill) {
        console.log('Fallback: Habilitando editor sem socket');
        quill.setText(''); // Limpa "Carregando..."
        quill.enable();
      }
    }, 3000);

    return () => {
      clearTimeout(fallbackTimer);
      socketService.leaveDocument(id);
      socketService.off('load-document');
      socketService.off('receive-changes');
      socketService.off('users-update');
    };
  }, [quill, user, id]);

  // Enviar mudanças
  useEffect(() => {
    if (!quill) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== 'user') return;
      socketService.sendChanges(id, delta);
    };

    quill.on('text-change', handler);
    return () => quill.off('text-change', handler);
  }, [quill, id]);

  // Auto-save com status visual
  useEffect(() => {
    if (!quill) return;

    const interval = setInterval(async () => {
      setSavingStatus('saving');
      try {
        const content = quill.getContents();
        socketService.saveDocument(id, content);
        setLastSaved(new Date());
        setSavingStatus('saved');

        // Retorna para idle após 2 segundos
        setTimeout(() => setSavingStatus('idle'), 2000);
      } catch (error) {
        setSavingStatus('error');
        console.error('Erro ao salvar:', error);
      }
    }, SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [quill, id]);

  const loadDocumentData = async () => {
    try {
      const response = await getDocument(id);
      const doc = response.data.document;
      setTitle(doc.title);
      setDocument(doc);
      setStarred(doc.starred || false);
      setCurrentDocument(doc);

      // Se tem conteúdo, carrega no editor
      if (doc.content && quill) {
        quill.setContents(doc.content);
        quill.enable();
      }

      if (doc.shareLinkEnabled && doc.shareLink) {
        setShareLink(`${window.location.origin}/shared/${doc.shareLink}`);
      }
    } catch (error) {
      console.error('Erro ao carregar documento:', error);

      // Mesmo com erro, habilita o editor
      if (quill) {
        quill.setText('');
        quill.enable();
      }

      // Só navega se for erro de autenticação
      if (error.response?.status === 401 || error.response?.status === 404) {
        navigate('/dashboard');
      }
    }
  };

  const handleSave = async () => {
    if (!quill) return;

    setSaving(true);
    try {
      const content = quill.getContents();
      await updateDocument(id, { title, content });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = async (newTitle) => {
    setTitle(newTitle);
    try {
      await updateDocument(id, { title: newTitle });
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
    }
  };

  const handleGenerateShareLink = async (permission) => {
    try {
      const response = await generateShareLink(id, permission);
      setShareLink(response.data.shareLink);
    } catch (error) {
      console.error('Erro ao gerar link:', error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
  };

  const handleAddCollaborator = async () => {
    if (!collaboratorEmail) return;

    try {
      await addCollaborator(id, collaboratorEmail, collaboratorPermission);
      setCollaboratorEmail('');
      loadDocumentData();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao adicionar colaborador');
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    try {
      await removeCollaborator(id, userId);
      loadDocumentData();
    } catch (error) {
      console.error('Erro ao remover colaborador:', error);
    }
  };

  const handleLoadVersions = async () => {
    try {
      const response = await getVersions(id);
      setVersions(response.data.versions);
      setShowVersions(true);
    } catch (error) {
      console.error('Erro ao carregar versões:', error);
    }
  };

  const handleRestoreVersion = async (versionId) => {
    if (!window.confirm('Deseja restaurar esta versão? A versão atual será salva no histórico.')) return;

    try {
      const response = await restoreVersion(id, versionId);
      quill.setContents(response.data.document.content);
      setShowVersions(false);
    } catch (error) {
      console.error('Erro ao restaurar versão:', error);
    }
  };

  const handleToggleStar = async () => {
    try {
      const response = await toggleStar(id);
      setStarred(response.data.starred);
    } catch (error) {
      console.error('Erro ao favoritar:', error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Handler para Magic Toolbar - Substitui texto selecionado
   */
  const handleTextTransform = (newText) => {
    if (!quill) return;

    const selection = quill.getSelection();
    if (!selection) return;

    quill.deleteText(selection.index, selection.length);
    quill.insertText(selection.index, newText);
    quill.setSelection(selection.index + newText.length);
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <SmartLayout
        title={title}
        onTitleChange={handleTitleChange}
        onNavigate={(path) => navigate(path)}
        onlineUsers={activeUsers}
        onShare={() => setShowShareModal(true)}
        onToggleAI={() => setShowAIPanel(!showAIPanel)}
        isAIPanelOpen={showAIPanel}
        savingStatus={savingStatus}
        isDarkMode={theme === 'dark'}
        onToggleDarkMode={toggleTheme}
      >
        {/* Quill Editor dentro do SmartLayout */}
        <div
          ref={quillRef}
          className="min-h-full"
        />

        {/* Magic Toolbar - Menu Flutuante */}
        <MagicToolbar
          editorRef={quillRef}
          onTextTransform={handleTextTransform}
        />

        {/* AI Chat Panel - Sidebar Direita */}
        <AIChatPanel
          isOpen={showAIPanel}
          onClose={() => setShowAIPanel(false)}
          documentContent={quill?.getText() || ''}
        />

        {/* Ghost Text Completion - AI Typing */}
        <GhostTextCompletion
          quillInstance={quill}
          isEnabled={ghostTextEnabled}
          onToggle={() => setGhostTextEnabled(!ghostTextEnabled)}
        />
      </SmartLayout>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-magic animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Compartilhar documento
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all hover:scale-110"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Adicionar por email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Adicionar pessoas
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={collaboratorEmail}
                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                    placeholder="Digite o email..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-slate-900 dark:text-white transition-all"
                  />
                  <select
                    value={collaboratorPermission}
                    onChange={(e) => setCollaboratorPermission(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white transition-all"
                  >
                    <option value="view">Visualizar</option>
                    <option value="edit">Editar</option>
                  </select>
                  <button
                    onClick={handleAddCollaborator}
                    className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all hover:scale-105"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Lista de colaboradores */}
              {document?.collaborators?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Pessoas com acesso
                  </label>
                  <div className="space-y-2">
                    {document.collaborators.map((collab) => (
                      <div
                        key={collab.user._id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                            style={{ backgroundColor: collab.user.color || '#6366f1' }}
                          >
                            {collab.user.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {collab.user.name}
                            </p>
                            <p className="text-xs text-slate-500">{collab.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 dark:text-slate-400 px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded-full">
                            {collab.permission === 'edit' ? 'Editor' : 'Visualizador'}
                          </span>
                          <button
                            onClick={() => handleRemoveCollaborator(collab.user._id)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all hover:scale-110"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Link de compartilhamento */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Link de compartilhamento
                </label>

                {shareLink ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-600 dark:text-slate-300"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 rounded-xl transition-all hover:scale-105"
                    >
                      {shareLinkCopied ? (
                        <Check size={18} className="text-emerald-500" />
                      ) : (
                        <Copy size={18} className="text-slate-600 dark:text-slate-300" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerateShareLink('view')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 text-slate-700 dark:text-slate-300"
                    >
                      <Eye size={18} />
                      Somente leitura
                    </button>
                    <button
                      onClick={() => handleGenerateShareLink('edit')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all hover:scale-105"
                    >
                      <Edit3 size={18} />
                      Com edição
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Versions Modal */}
      {showVersions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-magic animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Histórico de versões
              </h2>
              <button
                onClick={() => setShowVersions(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all hover:scale-110"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {versions.length > 0 ? (
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div
                      key={version._id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-all animate-fade-in"
                    >
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {new Date(version.savedAt).toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-slate-500">
                            por {version.savedBy?.name || 'Desconhecido'}
                            {version.label && ` • ${version.label}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRestoreVersion(version._id)}
                        className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all hover:scale-105"
                      >
                        Restaurar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 animate-fade-in">
                  <History size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Nenhuma versão salva ainda</p>
                  <p className="text-sm">As versões são salvas automaticamente ao editar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
