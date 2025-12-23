import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  TrendingUp,
  Clock,
  FileText,
  Target,
  Calendar,
  Award,
  ArrowLeft
} from 'lucide-react';
import analyticsApi from '../services/analyticsApi';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [summary, setSummary] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [streaks, setStreaks] = useState({ current: 0, longest: 0 });
  const [mostEdited, setMostEdited] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const [summaryRes, docsRes] = await Promise.all([
        analyticsApi.getSummary(period),
        analyticsApi.getMostEditedDocuments(5)
      ]);

      setSummary(summaryRes.data.summary);
      setHeatmap(summaryRes.data.heatmap);
      setStreaks(summaryRes.data.streaks);
      setMostEdited(docsRes.data.documents);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dados do gráfico de atividade (heatmap)
  const activityChartData = {
    labels: heatmap.map(d => new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
    datasets: [
      {
        label: 'Palavras escritas',
        data: heatmap.map(d => d.words),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Dados do gráfico de tempo
  const timeChartData = {
    labels: heatmap.map(d => new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
    datasets: [
      {
        label: 'Tempo ativo (minutos)',
        data: heatmap.map(d => Math.round(d.time / 60000)),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      }
    ]
  };

  // Dados dos documentos mais editados
  const docsChartData = {
    labels: mostEdited.map(d => d.document.title.substring(0, 20)),
    datasets: [
      {
        data: mostEdited.map(d => d.stats.totalWords),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const formatTime = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">Acompanhe sua produtividade</p>
              </div>
            </div>

            {/* Período */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
              <option value="year">Último ano</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            label="Palavras escritas"
            value={summary?.totalWords?.toLocaleString() || 0}
            color="indigo"
          />
          <StatCard
            icon={Clock}
            label="Tempo ativo"
            value={formatTime(summary?.totalTime || 0)}
            color="green"
          />
          <StatCard
            icon={Target}
            label="Média diária"
            value={`${summary?.averageWordsPerDay || 0} palavras`}
            color="orange"
          />
          <StatCard
            icon={Award}
            label="Streak atual"
            value={`${streaks.current} ${streaks.current === 1 ? 'dia' : 'dias'}`}
            color="pink"
            subtitle={`Recorde: ${streaks.longest} dias`}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de atividade */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="mr-2" size={20} />
              Atividade ao longo do tempo
            </h3>
            <div style={{ height: '300px' }}>
              <Line data={activityChartData} options={chartOptions} />
            </div>
          </div>

          {/* Gráfico de tempo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="mr-2" size={20} />
              Tempo de edição
            </h3>
            <div style={{ height: '300px' }}>
              <Bar data={timeChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Documentos mais editados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Documentos mais editados
            </h3>
            <div className="space-y-3">
              {mostEdited.map((doc, index) => (
                <div
                  key={doc.document._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => navigate(`/document/${doc.document._id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.document.title}</p>
                      <p className="text-sm text-gray-600">
                        {doc.stats.totalWords.toLocaleString()} palavras
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{doc.stats.totalSessions} sessões</p>
                    <p>{formatTime(doc.stats.totalTime)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de pizza */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuição de edições
            </h3>
            <div style={{ height: '300px' }}>
              <Doughnut data={docsChartData} options={{ ...chartOptions, maintainAspectRatio: true }} />
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">🎯 Seus insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-indigo-100 text-sm mb-1">Produtividade média</p>
              <p className="text-3xl font-bold">
                {summary?.averageWordsPerDay || 0} palavras/dia
              </p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm mb-1">Melhor streak</p>
              <p className="text-3xl font-bold">{streaks.longest} dias consecutivos</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm mb-1">Total de sessões</p>
              <p className="text-3xl font-bold">{summary?.totalSessions || 0} sessões</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, subtitle }) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    pink: 'bg-pink-100 text-pink-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
