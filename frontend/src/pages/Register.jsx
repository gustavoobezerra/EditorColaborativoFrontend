import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import { register } from '../services/api';
import { useAuthStore, useThemeStore } from '../store';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { theme } = useThemeStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim()
      });
      setAuth(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-4xl">📝</span>
            <h1 className="text-3xl font-bold text-white">CollabDocs</h1>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Comece a criar<br />
            documentos incríveis
          </h2>
          <p className="text-emerald-100 text-lg">
            Junte-se a milhares de pessoas que já usam o CollabDocs
            para colaborar em tempo real.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold text-white">∞</div>
              <div className="text-emerald-100 text-sm">Documentos ilimitados</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-emerald-100 text-sm">Gratuito para sempre</div>
            </div>
          </div>
        </div>

        <div className="text-emerald-200 text-sm">
          © 2025 CollabDocs. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">📝</span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CollabDocs</h1>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Criar sua conta
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                É rápido e gratuito
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength="6"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={20} />
                    Criar conta
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
