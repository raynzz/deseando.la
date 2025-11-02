import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/discover', label: 'Descubrir' },
  { to: '/community', label: 'Comunidad' },
  { to: '/how-it-works', label: 'Cómo funciona' },
  { to: '/about', label: 'Acerca de' },
];

const MARQUEE_TEXT =
  'Deseándola — Compartí tu deseo, activá tu red y hacelo realidad · Ideas, regalos, proyectos y causas · Sumate hoy';

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* ===== Top Marquee ===== */}
      <div className="relative overflow-hidden bg-black">
        <div className="py-4">
          <div className="marquee-container">
            <div
              className="marquee-track whitespace-nowrap text-sm text-white/90"
              aria-label="Novedades del proyecto"
            >
              {/* Repetimos el contenido para el loop continuo */}
              <span className="mx-8">{MARQUEE_TEXT}</span>
              <span className="mx-8">{MARQUEE_TEXT}</span>
              <span className="mx-8">{MARQUEE_TEXT}</span>
              <span className="mx-8">{MARQUEE_TEXT}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Main Nav ===== */}
      <nav className="bg-white border-b border-neutral-200/80 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span className="text-2xl font-bold text-neutral-900">
                  Deseándola
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden items-center gap-6 md:flex">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-[15px] text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              {/* Admin link opcional */}
              <Link
                to="/admin"
                className="text-[15px] text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Admin
              </Link>
            </div>

            {/* CTAs */}
            <div className="hidden items-center gap-3 md:flex">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
                  >
                    ¡Hola, {user.first_name || user.email}!
                  </Link>
                  <Link
                    to="/create-wish"
                    className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
                  >
                    Crear deseo
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/create-wish"
                    className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
                  >
                    Crear deseo
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-neutral-100 md:hidden"
              aria-label="Abrir menú"
              aria-expanded={open}
            >
              <svg
                className="h-6 w-6 text-neutral-800"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu Drawer */}
          {open && (
            <div className="md:hidden border-t border-neutral-200 py-3">
              <div className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-lg px-2 py-2 text-[15px] text-neutral-700 hover:bg-neutral-100"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/admin"
                  className="rounded-lg px-2 py-2 text-[15px] text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setOpen(false)}
                >
                  Admin
                </Link>
                {user ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <Link
                      to="/dashboard"
                      className="text-center text-sm text-neutral-700 hover:text-neutral-900"
                      onClick={() => setOpen(false)}
                    >
                      ¡Hola, {user.first_name || user.email}!
                    </Link>
                    <Link
                      to="/create-wish"
                      className="flex-1 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white text-center hover:bg-neutral-800"
                      onClick={() => setOpen(false)}
                    >
                      Crear deseo
                    </Link>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <Link
                      to="/login"
                      className="flex-1 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 text-center hover:bg-neutral-50"
                      onClick={() => setOpen(false)}
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      to="/create-wish"
                      className="flex-1 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white text-center hover:bg-neutral-800"
                      onClick={() => setOpen(false)}
                    >
                      Crear deseo
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Styles locales para el marquee */}
      <style>{`
        /* Marquee optimizado a 60fps con transform + will-change */
        .marquee-container {
          overflow: hidden;
          position: relative;
        }
        
        .marquee-track {
          display: inline-block;
          will-change: transform;
          animation: marqueeSlide 20s linear infinite;
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Loop perfecto: repetimos el contenido y trasladamos -50% */
        @keyframes marqueeSlide {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Accesibilidad: respeta reduce-motion */
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
