import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBaseUrl } from '@/lib/directus';

// Tipos para los datos
interface Wish {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  owner: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  cover_image?: string;
  visibility: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  return (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          {change && (
            <p className="mt-1 text-sm">
              <span className="font-medium">{change}</span> vs mes anterior
            </p>
          )}
        </div>
        <div className="rounded-lg bg-white/50 p-2">
          {icon}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener los deseos del usuario
  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const token = localStorage.getItem('directus_access_token');
        if (!token) {
          setError('No hay sesión activa');
          return;
        }

        const response = await fetch(`${getBaseUrl()}/items/wishes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar los deseos');
        }

        const data = await response.json();
        setWishes(data.data || []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchWishes();
  }, []);

  // Calcular métricas
  const totalWishes = wishes.length;
  const completedWishes = wishes.filter(w => w.status === 'completed').length;
  const inProgressWishes = wishes.filter(w => w.status === 'in_progress').length;
  const totalRaised = wishes.reduce((sum, wish) => sum + (wish.status === 'completed' ? 100 : 50), 0);
  const totalClicks = wishes.length * 25; // Simulación de clicks

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Bienvenido de vuelta, {user?.first_name || 'Usuario'}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas principales - 3 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Deseos totales"
            value={totalWishes}
            change="+12%"
            icon={<span className="text-xl">🎁</span>}
            color="blue"
          />
          <MetricCard
            title="Recaudado total"
            value={`$${totalRaised.toLocaleString()}`}
            change="+8%"
            icon={<span className="text-xl">💰</span>}
            color="green"
          />
          <MetricCard
            title="Clicks totales"
            value={totalClicks.toLocaleString()}
            change="+25%"
            icon={<span className="text-xl">👆</span>}
            color="purple"
          />
        </div>

        {/* Estadísticas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de los deseos</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completados</span>
                <span className="font-medium">{completedWishes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">En progreso</span>
                <span className="font-medium">{inProgressWishes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pendientes</span>
                <span className="font-medium">{totalWishes - completedWishes - inProgressWishes}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad reciente</h3>
            <div className="space-y-4">
              {wishes.slice(0, 3).map((wish) => (
                <div key={wish.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{wish.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(wish.updated_at)} • {wish.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
              {wishes.length === 0 && (
                <p className="text-sm text-gray-500">No hay actividad reciente</p>
              )}
            </div>
          </div>
        </div>

        {/* Lista de deseos */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Tus deseos</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {wishes.length > 0 ? (
              wishes.map((wish) => (
                <div key={wish.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{wish.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{wish.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        wish.status === 'completed' ? 'bg-green-100 text-green-800' :
                        wish.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {wish.status.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(wish.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <div className="text-gray-400 mb-2">📋</div>
                <p className="text-gray-500">No tienes deseos creados aún</p>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Crear primer deseo
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;