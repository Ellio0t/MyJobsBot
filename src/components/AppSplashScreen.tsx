import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface AppSplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onFinish,
  minDurationMs = 1800,
}) => {
  // La pantalla de espera SOLO se muestra en dispositivos móviles (ancho < 768px o app nativa Capacitor)
  const isMobile =
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 || Capacitor.isNativePlatform());

  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(!isMobile);

  useEffect(() => {
    // Si no es móvil (escritorio / monitor / tablet grande), omitir splash de inmediato
    if (!isMobile) {
      if (onFinish) onFinish();
      setIsDone(true);
      return;
    }

    // Incremento progresivo de la barra de carga mientras se sincroniza el feed
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        const step = Math.floor(Math.random() * 18) + 8;
        return Math.min(prev + step, 95);
      });
    }, 160);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setIsDone(true);
          if (onFinish) onFinish();
        }, 400);
      }, 250);
    }, minDurationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isMobile, minDurationMs, onFinish]);

  if (isDone || !isMobile) return null;

  return (
    <div
      className={`fixed inset-0 z-99999 flex flex-col items-center justify-center bg-[#070709] text-white select-none transition-opacity duration-400 md:hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#070709' }}
    >
      <div className="flex flex-col items-center max-w-xs w-full px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        {/* ISOTIPO OFICIAL WHITE JOBOT (SIN CÍRCULOS QUE LO ENVUELVAN) */}
        <div className="relative mb-6 flex items-center justify-center">
          <img
            src="/jobot.svg"
            alt="JobsBOT Logo"
            className="w-20 h-20 object-contain drop-shadow-[0_0_24px_rgba(255,255,255,0.4)]"
          />
        </div>

        {/* NOMBRE DE MARCA EN BLANCO: My JobsBOT */}
        <h1 className="font-montserrat text-xl sm:text-2xl font-black uppercase tracking-[0.22em] text-white drop-shadow-md mb-6">
          My JobsBOT
        </h1>

        {/* BARRA DE PROGRESO EN BLANCO */}
        <div className="w-44 h-1 bg-neutral-800 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-white transition-all duration-200 ease-out rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

