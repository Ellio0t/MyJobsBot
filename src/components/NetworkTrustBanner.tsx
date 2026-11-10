import React from 'react';
import { PortalBadge } from './PortalBadge';

interface NetworkTrustBannerProps {
  totalIndexed?: number;
}

export const NetworkTrustBanner: React.FC<NetworkTrustBannerProps> = ({ totalIndexed = 38 }) => {
  const networks: Array<'Google Jobs' | 'LinkedIn' | 'Indeed' | 'Get on Board' | 'Remotive'> = [
    'Google Jobs',
    'LinkedIn',
    'Indeed',
    'Get on Board',
    'Remotive',
  ];

  return (
    <div className="w-full bg-linear-to-r from-neutral-50 via-white to-neutral-50 dark:from-[#0d1017] dark:via-[#131722] dark:to-[#0d1017] border-y border-neutral-200/80 dark:border-[#222736] py-2.5 px-3 sm:px-6 shadow-2xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Etiqueta de confianza */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-montserrat text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Red de Portales Conectados
          </span>
          <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
          <span className="hidden sm:inline text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            {totalIndexed} vacantes reales verificadas
          </span>
        </div>

        {/* Badges de plataformas con sus logos oficiales */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {networks.map((net) => (
            <PortalBadge key={net} source={net} size="sm" />
          ))}
        </div>
      </div>
    </div>
  );
};

