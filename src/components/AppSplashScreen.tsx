import React, { useEffect, useState } from 'react';

interface AppSplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onFinish,
  minDurationMs = 1800,
}) => {
  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
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
  }, [minDurationMs, onFinish]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-99999 flex flex-col items-center justify-center bg-[#070709] text-white select-none transition-opacity duration-400 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#070709' }}
    >
      <div className="flex flex-col items-center max-w-xs w-full px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        {/* CÍRCULO CON ISOTIPO OFICIAL ROBOT JOBSBOT */}
        <div className="relative w-28 h-28 rounded-full border-4 border-white/90 bg-white/5 flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.25)] mb-7">
          <svg
            className="w-16 h-16 text-[#4ade80]"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M11 1V2H7C5.34315 2 4 3.34315 4 5V8C4 10.7614 6.23858 13 9 13H15C17.7614 13 20 10.7614 20 8V5C20 3.34315 18.6569 2 17 2H13V1H11ZM6 5C6 4.44772 6.44772 4 7 4H17C17.5523 4 18 4.44772 18 5V8C18 9.65685 16.6569 11 15 11H9C7.34315 11 6 9.65685 6 8V5ZM9.5 9C10.3284 9 11 8.32843 11 7.5C11 6.67157 10.3284 6 9.5 6C8.67157 6 8 6.67157 8 7.5C8 8.32843 8.67157 9 9.5 9ZM14.5 9C15.3284 9 16 8.32843 16 7.5C16 6.67157 15.3284 6 14.5 6C13.6716 6 13 6.67157 13 7.5C13 8.32843 13.6716 9 14.5 9ZM6 22C6 18.6863 8.68629 16 12 16C15.3137 16 18 18.6863 18 22H20C20 17.5817 16.4183 14 12 14C7.58172 14 4 17.5817 4 22H6Z" />
          </svg>
        </div>

        {/* NOMBRE DE MARCA SOLICITADO: My JobsBOT */}
        <h1 className="font-montserrat text-2xl font-black uppercase tracking-[0.22em] text-white drop-shadow-md mb-6">
          My JobsBOT
        </h1>

        {/* BARRA DE PROGRESO IDÉNTICA A LA IMAGEN */}
        <div className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-white transition-all duration-200 ease-out rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="font-montserrat text-[10px] text-neutral-500 font-semibold uppercase tracking-widest mt-4">
          Conectando Red de Empleo...
        </p>
      </div>
    </div>
  );
};

