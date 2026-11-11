import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, UserCheck, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { UserSession } from '../types';
import {
  signInWithGoogleReal,
  signInWithEmailReal,
  registerWithEmailReal,
} from '../services/firebaseAuth';
import { JobotIcon } from './JobotIcon';

interface AuthModalProps {
  brandName: string;
  onClose: () => void;
  onSuccessLogin: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ brandName, onClose, onSuccessLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // BLOQUEO ESTRICTO DEL SCROLL DEL BODY
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // INICIO REAL CON GOOGLE
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const session = await signInWithGoogleReal();
      onSuccessLogin(session);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  // INICIO / REGISTRO REAL CON CORREO
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let session: UserSession;
      if (isRegistering) {
        if (!fullName.trim()) {
          setErrorMessage('Por favor ingresa tu nombre completo.');
          setIsLoading(false);
          return;
        }
        session = await registerWithEmailReal(email.trim(), password, fullName.trim());
      } else {
        session = await signInWithEmailReal(email.trim(), password);
      }
      onSuccessLogin(session);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error al procesar tu solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="modal-overlay fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overscroll-contain"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#12151c] text-neutral-900 dark:text-neutral-100 w-full max-w-md max-h-[92vh] flex flex-col rounded-2xl border border-neutral-300 dark:border-[#2b3140] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* HEADER */}
        <div className="px-5 sm:px-6 py-4 bg-neutral-950 dark:bg-[#0c0e13] text-white flex items-center justify-between border-b border-neutral-800 dark:border-[#202532] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 dark:bg-[#181c26] border border-white/10 dark:border-[#2d3444] flex items-center justify-center shrink-0">
              <JobotIcon className="w-5 h-5 text-emerald-400 dark:text-[#4ade80]" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-montserrat font-bold tracking-[1.5px] uppercase text-neutral-400 block">
                ACCESO EJECUTIVO • {brandName}
              </span>
              <h3 className="font-montserrat text-sm sm:text-base font-extrabold tracking-wide uppercase mt-0.5">
                {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Inicia sesión para **sincronizar tus CVs ATS en la nube**, guardar tus postulaciones y personalizar tu perfil profesional.
          </p>

          {/* BANNER DE ERROR REAL */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* GOOGLE OAUTH BUTTON (REAL) */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-[#2f3545] bg-white dark:bg-[#181c25] hover:bg-neutral-50 dark:hover:bg-[#202532] text-neutral-900 dark:text-white transition-colors flex items-center justify-center gap-3 font-montserrat text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            ) : (
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
            )}
            <span>Continuar con Google</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-neutral-200 dark:border-[#232835]" />
            <span className="shrink mx-3 text-[10px] font-montserrat uppercase tracking-widest text-neutral-400">
              o con tu correo
            </span>
            <div className="grow border-t border-neutral-200 dark:border-[#232835]" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {isRegistering && (
              <div>
                <label className="block font-montserrat text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Elliot Barrios"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2f3545] text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
                />
              </div>
            )}

            <div>
              <label className="block font-montserrat text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2f3545] text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
                />
              </div>
            </div>

            <div>
              <label className="block font-montserrat text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2f3545] text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat text-xs font-extrabold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              <span>{isRegistering ? 'Crear Cuenta Real' : 'Entrar al Sistema'}</span>
            </button>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs pt-2 border-t border-neutral-200 dark:border-[#202532]">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMessage(null);
              }}
              className="font-montserrat font-bold text-neutral-900 dark:text-[#4ade80] hover:underline cursor-pointer"
            >
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo aquí? Regístrate gratis'}
            </button>
            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Firebase Auth SSL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
