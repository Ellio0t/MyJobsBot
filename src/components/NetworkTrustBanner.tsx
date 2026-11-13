import React from 'react';
import { PortalBadge } from './PortalBadge';

interface NetworkTrustBannerProps {
  totalIndexed?: number;
}

export const NetworkTrustBanner: React.FC<NetworkTrustBannerProps> = ({ totalIndexed = 89 }) => {
  // Las bolsas de empleo internacionales líderes conectadas
  const networks = [
    'LinkedIn',
    'Indeed',
    'ZipRecruiter',
    'Glassdoor',
    'Monster',
    'FlexJobs',
    'Wellfound',
    'Get on Board',
    'Remotive',
    'Dice',
    'Talent.com',
    'JobLeads',
  ];

  // Duplicamos el listado para lograr un loop infinito continuo y fluido
  const loopedNetworks = [...networks, ...networks];

  return (
    <div
      className="no-print w-full max-w-full bg-neutral-50/80 dark:bg-[#0c0f16]/90 border-y border-neutral-200/70 dark:border-[#1f2432] py-2.5 px-3 sm:px-6 relative overflow-hidden backdrop-blur-md"
      style={{ maxWidth: '100%', contain: 'paint layout' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 w-full min-w-0 overflow-hidden">
        {/* Etiqueta de confianza y promesa de valor */}
        <div className="flex items-center gap-2.5 shrink-0 select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-2">
            <span className="font-montserrat text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white whitespace-nowrap">
              Red de +12 Bolsas Conectadas
            </span>
            <span className="hidden xl:inline text-neutral-300 dark:text-neutral-700">•</span>
            <span className="hidden xl:inline text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
              Lo mejor de las bolsas mundiales en un solo lugar
            </span>
          </div>
        </div>

        {/* Ticker / Carrusel continuo infinito con desvanecimiento en bordes (Estilo Stripe / Linear) */}
        <div
          className="relative overflow-hidden w-full flex-1 min-w-0"
          style={{ maxWidth: '100%', contain: 'paint' }}
        >
          {/* Máscara de desvanecimiento izquierda */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 z-10 bg-gradient-to-r from-neutral-50 dark:from-[#0c0f16] to-transparent" />

          {/* Máscara de desvanecimiento derecha */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 z-10 bg-gradient-to-l from-neutral-50 dark:from-[#0c0f16] to-transparent" />

          {/* Marquee en movimiento suave */}
          <div className="animate-marquee flex items-center gap-2.5 py-0.5 cursor-grab active:cursor-grabbing">
            {loopedNetworks.map((net, idx) => (
              <PortalBadge
                key={`${net}-${idx}`}
                source={net}
                size="sm"
                variant="glass"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
