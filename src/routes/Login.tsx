import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getBaseUrl } from '@/lib/directus';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = getBaseUrl();
  const valid = /\S+@\S+\.\S+/.test(email) && password.trim().length >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        const msg = json?.errors?.[0]?.message || 
                   json?.message || 
                   `Error ${res.status}`;
        throw new Error(msg);
      }
      
      const tokens = json?.data || json;
      if (!tokens?.access_token) throw new Error('No token returned');
      
      // Iniciar sesión y redirigir al admin
      login(tokens);
      navigate('/admin');
      
      // Limpiar formulario
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err?.message || 'Error de inicio de sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-neutral-900">
            <span className="text-xl">✨</span>
            Deseándola
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Iniciar sesión</h1>
          <p className="mt-1 text-sm opacity-70">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Registrate aquí
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Contraseña
              </label>
              <div className="flex items-stretch">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="w-full rounded-l-lg border px-3 py-2 outline-none focus:ring"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="rounded-r-lg border border-l-0 px-3 text-sm hover:bg-black/5"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!valid || loading}
              className={`w-full rounded-lg px-4 py-2 font-medium text-white ${
                !valid || loading
                  ? 'cursor-not-allowed bg-neutral-400'
                  : 'bg-black hover:bg-neutral-800'
              }`}
            >
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs opacity-70">
              Al iniciar sesión, aceptás nuestros{' '}
              <Link to="/terms" className="text-blue-600 hover:underline">
                Términos y condiciones
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;