import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Filter, Sparkles, TrendingUp, X } from 'lucide-react';
import templateApi from '../services/templateApi';
import { useAuthStore } from '../store';

const CATEGORIES = [
  { key: 'all', label: 'Todos', icon: '📋' },
  { key: 'meeting', label: 'Reunião', icon: '🤝' },
  { key: 'report', label: 'Relatório', icon: '📊' },
  { key: 'project', label: 'Projeto', icon: '🎯' },
  { key: 'notes', label: 'Notas', icon: '📝' },
  { key: 'other', label: 'Outros', icon: '📄' }
];

export default function TemplateGallery() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyTemplates, setShowMyTemplates] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [category, searchQuery]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'all') params.category = category;
      if (searchQuery) params.search = searchQuery;

      const response = await templateApi.getTemplates(params);
      let data = response.data.templates;

      // Filtrar apenas meus templates se ativado
      if (showMyTemplates && user) {
        data = data.filter(t => t.author._id === user._id);
      }

      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId) => {
    try {
      const response = await templateApi.useTemplate(templateId, '');
      navigate(`/document/${response.data.document._id}`);
    } catch (error) {
      console.error('Erro ao usar template:', error);
      alert('Erro ao criar documento do template');
    }
  };

  const handleDeleteTemplate = async (templateId, e) => {
    e.stopPropagation();
    if (!window.confirm('Deseja deletar este template?')) return;

    try {
      await templateApi.deleteTemplate(templateId);
      loadTemplates();
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      alert('Erro ao deletar template');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
              <Sparkles className="text-blue-500" size={24} />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Galeria de Templates
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
            />
          </div>

          <button
            onClick={() => { setShowMyTemplates(!showMyTemplates); loadTemplates(); }}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${
              showMyTemplates
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Meus Templates
          </button>
        </div>

        {/* Categorias */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                category === cat.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid de Templates */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.map(template => (
              <div
                key={template._id}
                onClick={() => handleUseTemplate(template._id)}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg cursor-pointer transition-all p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{template.icon}</span>
                  {template.author._id === user?._id && (
                    <button
                      onClick={(e) => handleDeleteTemplate(template._id, e)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                    >
                      <X size={16} className="text-red-500" />
                    </button>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {template.title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {template.description || 'Sem descrição'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span>{template.usageCount || 0} usos</span>
                  </div>
                  {template.isPublic && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                      Público
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum template encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Tente outro termo de busca' : 'Crie seu primeiro template'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
