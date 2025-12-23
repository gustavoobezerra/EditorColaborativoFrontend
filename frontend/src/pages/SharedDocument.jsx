import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { FileText, Eye, Edit3, LogIn } from 'lucide-react';
import { getSharedDocument } from '../services/api';
import socketService from '../services/socket';
import { useAuthStore, useThemeStore } from '../store';

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ['link', 'image', 'code-block'],
  ['clean']
];

export default function SharedDocument() {
  const { shareLink } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { theme } = useThemeStore();

  useEffect(() => {
    loadDocument();
  }, [shareLink]);

  useEffect(() => {
    if (!quillRef.current || !document) return;

    const q = new Quill(quillRef.current, {
      theme: 'snow',
      modules: {
        toolbar: document.permission === 'edit' ? TOOLBAR_OPTIONS : false
      },
      placeholder: 'Carregando...',
      readOnly: document.permission === 'view'
    });

    q.setContents(document.content);
    setQuill(q);

    // Se tem permissão de edição e está autenticado, conectar ao socket
    if (document.permission === 'edit' && isAuthenticated) {
      socketService.connect();
      socketService.joinDocument(document._id, user);

      socketService.on('receive-changes', (delta) => {
        q.updateContents(delta);
      });

      const handler = (delta, oldDelta, source) => {
        if (source !== 'user') return;
        socketService.sendChanges(document._id, delta);
      };

      q.on('text-change', handler);

      return () => {
        socketService.leaveDocument(document._id);
        socketService.off('receive-changes');
        q.off('text-change', handler);
      };
    }
  }, [document, isAuthenticated, user]);

  const loadDocument = async () => {
    try {
      const response = await getSharedDocument(shareLink);
      setDocument(response.data.document);
    } catch (error) {
      setError(error.response?.data?.message || 'Documento não encontrado');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Documento não disponível
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
          {error}
        </p>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
        >
          <LogIn size={20} />
          Fazer login
        </button>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{document?.icon || '📄'}</span>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {document?.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
              document?.permission === 'edit'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              {document?.permission === 'edit' ? (
                <>
                  <Edit3 size={14} />
                  Modo edição
                </>
              ) : (
                <>
                  <Eye size={14} />
                  Somente leitura
                </>
              )}
            </div>

            {!isAuthenticated && (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                <LogIn size={16} />
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div
            ref={quillRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[500px]"
          />
        </div>
      </div>

      {/* Footer com informações */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>Compartilhado por</span>
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                style={{ backgroundColor: document?.owner?.color || '#3B82F6' }}
              >
                {document?.owner?.name?.[0]?.toUpperCase()}
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {document?.owner?.name}
              </span>
            </div>
          </div>

          <div>
            Powered by <span className="font-semibold text-blue-600">CollabDocs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
