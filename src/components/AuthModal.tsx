import React, { useState } from 'react';
import { X, Lock, Mail, UserCheck, ShieldCheck } from 'lucide-react';
import { UserSession } from '../types';

interface AuthModalProps {
  brandName: string;
  onClose: () => void;
  onSuccessLogin: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ brandName, onClose, onSuccessLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('elliotbarrios.dev@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Elliot Barrios');

  const handleGoogleLogin = () => {
    onSuccessLogin({
      isAuthenticated: true,
      uid: 'google-uid-elliot',
      displayName: 'Elliot Barrios',
      email: 'elliotbarrios.dev@gmail.com',
      photoURL: '/elliot_barrios.jpg',
      authProvider: 'google',
    });
    onClose();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccessLogin({
      isAuthenticated: true,
      uid: 'email-uid-elliot',
      displayName: fullName || 'Elliot Barrios',
      email: email || 'elliotbarrios.dev@gmail.com',
      photoURL: '/elliot_barrios.jpg',
      authProvider: 'email',
    });
    onClose();
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121418] text-neutral-900 dark:text-neutral-100 w-full max-w-md rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="px-6 py-5 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <i className="ri-robot-3-line text-xl text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-montserrat font-bold tracking-[2px] uppercase text-neutral-400 block">
                ACCESO EJECUTIVO • {brandName}
              </span>
              <h3 className="font-montserrat text-base font-extrabold tracking-wide uppercase mt-0.5">
                {isRegistering ? 'Crear Cuenta Profesional' : 'Iniciar Sesión'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            El radar de empleos siempre es libre para visitantes. Inicia sesión para **subir o crear tu CV ATS**, usar tu **foto como avatar**, calcular tu **% de Match automático** y crear múltiples versiones con IA.
          </p>

          {/* GOOGLE OAUTH BUTTON */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-3 font-montserrat text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            Continuar con Google
          </button>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-neutral-200 dark:border-neutral-800" />
            <span className="shrink mx-3 text-[10px] font-montserrat uppercase tracking-widest text-neutral-400">
              o con tu correo
            </span>
            <div className="grow border-t border-neutral-200 dark:border-neutral-800" />
          </div>

          {/* EMAIL & PASSWORD FORM */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {isRegistering && (
              <div>
                <label className="block font-montserrat text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                />
              </div>
            )}

            <div>
              <label className="block font-montserrat text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-montserrat text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-montserrat text-xs font-extrabold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              {isRegistering ? 'Crear Cuenta y Cargar mi CV' : 'Entrar y Sincronizar mi CV'}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="font-montserrat font-bold underline cursor-pointer"
            >
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo aquí? Regístrate gratis'}
            </button>
            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Cifrado OAuth 2.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

