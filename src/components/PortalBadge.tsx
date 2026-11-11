import React from 'react';
import { JobOffer } from '../types';

interface PortalBadgeProps {
  source: JobOffer['source'];
  size?: 'sm' | 'md';
  showLabel?: boolean;
  variant?: 'colorful' | 'glass';
}

export const PortalBadge: React.FC<PortalBadgeProps> = ({
  source,
  size = 'sm',
  showLabel = true,
  variant = 'colorful',
}) => {
  let normalized = (source || 'ZipRecruiter').trim();
  // Eliminar referencias a Google Jobs: mostrar la bolsa de trabajo agregada real
  if (normalized.toLowerCase().includes('google') || normalized === 'Google' || normalized === 'Google Jobs') {
    normalized = 'ZipRecruiter';
  }

  // Configuración de branding oficial para las bolsas de trabajo líderes mundiales
  const renderIconAndLabel = () => {
    switch (normalized) {
      case 'LinkedIn':
        return {
          icon: <i className="fa-brands fa-linkedin text-[#0a66c2] text-sm shrink-0" />,
          label: 'LinkedIn',
          bgClass: 'bg-[#0a66c2]/10 border-[#0a66c2]/25 text-[#0a66c2] dark:text-[#70b5f9]',
        };
      case 'Indeed':
        return {
          icon: (
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="#2164f3">
              <path d="M11.56 0c-2.3 0-4.17 1.87-4.17 4.17 0 .39.05.77.16 1.13C4.19 6.2 1.6 8.92 1.6 12.22c0 3.65 2.97 6.62 6.62 6.62.8 0 1.57-.14 2.28-.4v5.56h4.16V8.65c.98-.6 1.64-1.68 1.64-2.91 0-1.93-1.57-3.5-3.5-3.5-.4 0-.78.07-1.14.2V.96C11.63.42 11.6 0 11.56 0z" />
            </svg>
          ),
          label: 'Indeed',
          bgClass: 'bg-[#2164f3]/10 border-[#2164f3]/25 text-[#2164f3] dark:text-[#60a5fa]',
        };
      case 'ZipRecruiter':
        return {
          icon: (
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="#008060">
              <path d="M12 2L3 9h3v11h12V9h3L12 2zm1 14h-2v-4h2v4zm0-6h-2V8h2v2z" />
            </svg>
          ),
          label: 'ZipRecruiter',
          bgClass: 'bg-emerald-600/10 border-emerald-600/25 text-emerald-800 dark:text-emerald-400',
        };
      case 'Glassdoor':
        return {
          icon: <i className="fa-solid fa-door-open text-[#0caa41] text-xs shrink-0" />,
          label: 'Glassdoor',
          bgClass: 'bg-[#0caa41]/10 border-[#0caa41]/25 text-[#0caa41] dark:text-[#34d399]',
        };
      case 'Monster':
        return {
          icon: <i className="fa-solid fa-dragon text-[#6e46ae] text-xs shrink-0" />,
          label: 'Monster',
          bgClass: 'bg-purple-600/10 border-purple-600/25 text-purple-700 dark:text-purple-400',
        };
      case 'FlexJobs':
        return {
          icon: <i className="fa-solid fa-briefcase text-[#1e88e5] text-xs shrink-0" />,
          label: 'FlexJobs',
          bgClass: 'bg-blue-600/10 border-blue-600/25 text-blue-700 dark:text-blue-400',
        };
      case 'Wellfound':
        return {
          icon: <i className="fa-solid fa-hand-peace text-neutral-800 dark:text-neutral-200 text-xs shrink-0" />,
          label: 'Wellfound',
          bgClass: 'bg-neutral-800/10 border-neutral-800/20 text-neutral-900 dark:text-neutral-200',
        };
      case 'Dice':
        return {
          icon: <i className="fa-solid fa-dice-d6 text-red-600 text-xs shrink-0" />,
          label: 'Dice',
          bgClass: 'bg-red-600/10 border-red-600/25 text-red-700 dark:text-red-400',
        };
      case 'Get on Board':
        return {
          icon: <i className="fa-solid fa-compass text-cyan-500 dark:text-cyan-400 text-xs shrink-0" />,
          label: 'Get on Board',
          bgClass: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-700 dark:text-cyan-300',
        };
      case 'Remotive':
        return {
          icon: <i className="fa-solid fa-earth-americas text-rose-500 dark:text-rose-400 text-xs shrink-0" />,
          label: 'Remotive',
          bgClass: 'bg-rose-500/10 border-rose-500/25 text-rose-700 dark:text-rose-300',
        };
      case 'RemoteOK':
        return {
          icon: <i className="fa-solid fa-wifi text-amber-500 dark:text-amber-400 text-xs shrink-0" />,
          label: 'RemoteOK',
          bgClass: 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300',
        };
      case 'JobLeads':
        return {
          icon: <i className="fa-solid fa-magnifying-glass text-indigo-600 dark:text-indigo-400 text-xs shrink-0" />,
          label: 'JobLeads',
          bgClass: 'bg-indigo-600/10 border-indigo-600/25 text-indigo-700 dark:text-indigo-400',
        };
      case 'Talent.com':
        return {
          icon: <i className="fa-solid fa-star text-violet-600 dark:text-violet-400 text-xs shrink-0" />,
          label: 'Talent.com',
          bgClass: 'bg-violet-600/10 border-violet-600/25 text-violet-700 dark:text-violet-400',
        };
      default:
        return {
          icon: <i className="fa-solid fa-arrow-up-right-from-square text-emerald-500 dark:text-[#4ade80] text-[10px] shrink-0" />,
          label: normalized,
          bgClass: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-[#4ade80]',
        };
    }
  };

  const portal = renderIconAndLabel();

  const containerClass =
    variant === 'glass'
      ? 'bg-white/80 dark:bg-[#141824]/90 border border-neutral-200/90 dark:border-[#272e3d] text-neutral-800 dark:text-neutral-200 hover:border-emerald-500/50 hover:bg-white dark:hover:bg-[#1a2130] shadow-2xs transition-all'
      : portal.bgClass;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-montserrat font-bold tracking-tight select-none shrink-0 ${containerClass} ${
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
      }`}
      title={`Oferta laboral provista y verificada por ${portal.label}`}
    >
      {portal.icon}
      {showLabel && <span>{portal.label}</span>}
    </span>
  );
};
