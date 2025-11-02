import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBaseUrl } from '@/lib/directus';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = getBaseUrl();
  const valid = name.trim() !== '' && 
                /\S+@\S+\.\S+/.test(email) && 
                password.trim().length >= 6 && 
                password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Primero crear el usuario
      const userRes = await fetch(`${baseUrl.replace(/\/+$/, '')}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: name.trim(),
          email,
          role: 'default', // o el rol por defecto que tengas configurado
          status: 'active',
        }),
      });
      
      if (!userRes.ok) {
        const json = await userRes.json();
        throw new Error(json?.errors?.[0]?.message || 'Error al crear usuario');
      }
      
      // Luego iniciar sesión con el usuario creado
      const loginRes = await fetch(`${baseUrl.replace(/\/+$/, '')}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const loginJson = await loginRes.json();
      
      if (!loginRes.ok) {
        throw new Error(loginJson?.errors?.[0]?.message || 'Error al iniciar sesión');
      }
      
      const tokens = loginJson?.data || loginJson;
      if (!tokens?.access_token) throw new Error('No token devuelto');
      
      // Guardar tokens y redirigir al admin
      localStorage.setItem('access_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
      
      // Limpiar formulario
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Redirigir al dashboard
      navigate('/admin');
      
    } catch (err: any) {
      setError(err?.message || 'Error en el registro');
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
          <h1 className="mt-4 text-2xl font-semibold">Crear cuenta</h1>
          <p className="mt-1 text-sm opacity-70">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                autoFocus
              />
            </div>

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
              <p className="mt-1 text-xs opacity-70">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type={showPass ? 'text' : 'password'}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
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
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs opacity-70">
              Al crear una cuenta, aceptás nuestros{' '}
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

export default Register;