import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Plus, LogOut, Trash2, Search, Star, Users, Clock,
  MoreVertical, Copy, Share2, Archive, Grid, List, Moon, Sun,
  FolderOpen, Filter, X, Sparkles, BarChart3
} from 'lucide-react';
import {
  getDocuments, createDocument, deleteDocument,
  duplicateDocument, toggleStar
} from '../services/api';
import { useAuthStore, useDocumentStore, useThemeStore

 } from '../store';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocIcon, setNewDocIcon] = useState('📄');

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, toggleTheme } = useThemeStore();
  const {
    documents, setDocuments, filter, setFilter,
    searchQuery, setSearchQuery, viewMode, setViewMode,
    updateDocumentInList, removeDocument
  } = useDocumentStore();

  const icons = ['📄', '📝', '📋', '📑', '📊', '📈', '💡', '🎯', '📌', '✨', '🚀', '💼'];

  useEffect(() => {
    loadDocuments();
  }, [filter]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const loadDocuments = async () => {
    try {
      const params = {};
      if (filter === 'starred') params.starred = 'true';
      if (filter === 'archived') params.archived = 'true';

      const response = await getDocuments(params);
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = useMemo(() => {
    if (!searchQuery) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter(doc =>
      doc.title.toLowerCase().includes(query) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [documents, searchQuery]);

  const handleCreateDocument = async () => {
    if (creating) return;
    setCreating(true);

    try {
      const response = await createDocument({
        title: newDocTitle || 'Novo Documento',
        icon: newDocIcon
      });
      setShowNewDocModal(false);
      setNewDocTitle('');
      setNewDocIcon('📄');
      navigate(`/document/${response.data.document._id}`);
    } catch (error) {
      console.error('Erro ao criar documento:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleQuickCreate = async () => {
    if (creating) return;
    setCreating(true);

    try {
      const response = await createDocument({ title: 'Novo Documento' });
      navigate(`/document/${response.data.document._id}`);
    } catch (error) {
      console.error('Erro ao criar documento:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDocument = async (id, e) => {
    e.stopPropagation();
    setMenuOpen(null);

    if (window.confirm('Deseja realmente deletar este documento?')) {
      try {
        await deleteDocument(id);
        removeDocument(id);
      } catch (error) {
        console.error('Erro ao deletar:', error);
      }
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    setMenuOpen(null);

    try {
      const response = await duplicateDocument(id);
      navigate(`/document/${response.data.document._id}`);
    } catch (error) {
      console.error('Erro ao duplicar:', error);
    }
  };

  const handleToggleStar = async (id, e) => {
    e.stopPropagation();
    setMenuOpen(null);

    try {
      const response = await toggleStar(id);
      updateDocumentInList(id, { starred: response.data.starred });
    } catch (error) {
      console.error('Erro ao favoritar:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (date) => {
    const now = new Date();
    const docDate = new Date(date);
    const diffTime = Math.abs(now - docDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Hoje às ${docDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return docDate.toLocaleDateString('pt-BR');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📝</div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                CollabDocs
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon size={20} className="text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun size={20} className="text-gray-300" />
                )}
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: user?.color || '#3B82F6' }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                  {user?.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span className="hidden sm:block">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleQuickCreate}
            disabled={creating}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50"
          >
            <Plus size={20} />
            Novo Documento
          </button>

          <button
            onClick={() => navigate('/templates')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
          >
            <Sparkles size={20} />
            Templates
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
          >
            <BarChart3 size={20} />
            Analytics
          </button>

          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Todos', icon: FolderOpen },
            { key: 'starred', label: 'Favoritos', icon: Star },
            { key: 'shared', label: 'Compartilhados', icon: Users },
            { key: 'archived', label: 'Arquivados', icon: Archive }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                filter === key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Documents Grid/List */}
        {filteredDocuments.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'flex flex-col gap-3'
          }>
            {filteredDocuments.map((doc) => (
              <div
                key={doc._id}
                onClick={() => navigate(`/document/${doc._id}`)}
                className={`group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg cursor-pointer transition-all ${
                  viewMode === 'list' ? 'flex items-center p-4' : 'p-5'
                }`}
              >
                <div className={`flex ${viewMode === 'list' ? 'items-center gap-4 flex-1' : 'flex-col'}`}>
                  <div className={`flex items-center gap-3 ${viewMode === 'grid' ? 'mb-3' : ''}`}>
                    <span className="text-2xl">{doc.icon || '📄'}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                      {doc.title}
                    </h3>
                    {doc.starred && (
                      <Star size={16} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className={`flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 ${
                    viewMode === 'grid' ? 'mt-auto pt-3 border-t border-gray-100 dark:border-gray-700' : ''
                  }`}>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatDate(doc.updatedAt)}</span>
                    </div>
                    {doc.collaborators?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{doc.collaborators.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === doc._id ? null : doc._id);
                    }}
                    className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      viewMode === 'grid' ? 'absolute top-3 right-3' : ''
                    } ${menuOpen === doc._id ? 'bg-gray-100 dark:bg-gray-700' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <MoreVertical size={18} className="text-gray-500" />
                  </button>

                  {menuOpen === doc._id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(null);
                        }}
                      />
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 py-1 overflow-hidden">
                        <button
                          onClick={(e) => handleToggleStar(doc._id, e)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Star size={16} className={doc.starred ? 'text-yellow-500 fill-yellow-500' : ''} />
                          {doc.starred ? 'Remover favorito' : 'Favoritar'}
                        </button>
                        <button
                          onClick={(e) => handleDuplicate(doc._id, e)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Copy size={16} />
                          Duplicar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(null);
                            navigate(`/document/${doc._id}?share=true`);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Share2 size={16} />
                          Compartilhar
                        </button>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={(e) => handleDeleteDocument(doc._id, e)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={16} />
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'Nenhum documento encontrado' : 'Nenhum documento ainda'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery
                ? 'Tente buscar com outros termos'
                : 'Crie seu primeiro documento para começar'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleQuickCreate}
                disabled={creating}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                <Plus size={20} />
                Criar primeiro documento
              </button>
            )}
          </div>
        )}
      </main>

      {/* New Document Modal */}
      {showNewDocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Novo Documento
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Digite o título..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ícone
              </label>
              <div className="flex flex-wrap gap-2">
                {icons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewDocIcon(icon)}
                    className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-all ${
                      newDocIcon === icon
                        ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewDocModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateDocument}
                disabled={creating}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {creating ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
