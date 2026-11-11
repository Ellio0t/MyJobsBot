import React from 'react';
import { PortalBadge } from './PortalBadge';

interface NetworkTrustBannerProps {
  totalIndexed?: number;
}

export const NetworkTrustBanner: React.FC<NetworkTrustBannerProps> = ({ totalIndexed = 89 }) => {
  // Las bolsas de empleo internacionales líderes que JoBOT agrega y conecta
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

  return (
    <div className="w-full bg-linear-to-r from-neutral-50 via-white to-neutral-50 dark:from-[#0c0f16] dark:via-[#131722] dark:to-[#0c0f16] border-y border-neutral-200/80 dark:border-[#222736] py-3 px-3 sm:px-6 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Etiqueta de confianza y promesa de valor */}
        <div className="flex items-center gap-2.5 shrink-0 text-center lg:text-left">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-montserrat text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                Lo mejor de +12 Bolsas de Trabajo en un solo lugar
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/15 text-emerald-700 dark:text-[#4ade80] border border-emerald-500/30">
                Red Unificada
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              Agregamos y sincronizamos vacantes reales de las principales bolsas mundiales
            </p>
          </div>
        </div>

        {/* Badges de las plataformas oficiales (Sin Google Jobs, solo bolsas de trabajo reales) */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-1.5 sm:gap-2 max-w-2xl">
          {networks.map((net) => (
            <PortalBadge key={net} source={net} size="sm" />
          ))}
        </div>
      </div>
    </div>
  );
};
