import React from 'react';
import { JobOffer } from '../types';

interface PortalBadgeProps {
  source: JobOffer['source'];
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const PortalBadge: React.FC<PortalBadgeProps> = ({
  source,
  size = 'sm',
  showLabel = true,
}) => {
  const normalized = (source || 'Google Jobs').trim();

  // Configuración de branding oficial para cada red de empleo
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
      case 'Glassdoor':
        return {
          icon: <i className="fa-solid fa-door-open text-emerald-600 dark:text-emerald-400 text-xs shrink-0" />,
          label: 'Glassdoor',
          bgClass: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300',
        };
      case 'RemoteOK':
        return {
          icon: <i className="fa-solid fa-wifi text-amber-500 dark:text-amber-400 text-xs shrink-0" />,
          label: 'RemoteOK',
          bgClass: 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300',
        };
      default:
        // Si es Google Jobs o contiene Google
        if (normalized.toLowerCase().includes('google') || normalized === 'Google' || normalized === 'Google Jobs') {
          return {
            icon: (
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            ),
            label: 'Google Jobs',
            bgClass: 'bg-neutral-100 dark:bg-[#191d27] border-neutral-200 dark:border-[#2d3342] text-neutral-800 dark:text-neutral-200',
          };
        }
        // Para cualquier otro portal indexado por Google Jobs (Univision, Learn4Good, Doctoralia, etc.)
        return {
          icon: <i className="fa-solid fa-arrow-up-right-from-square text-emerald-500 dark:text-[#4ade80] text-[10px] shrink-0" />,
          label: normalized,
          bgClass: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-[#4ade80]',
        };
    }
  };

  const portal = renderIconAndLabel();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border font-montserrat font-bold tracking-tight ${
        size === 'sm' ? 'text-[10px]' : 'text-xs px-2.5 py-1'
      } ${portal.bgClass} shadow-2xs select-none`}
      title={`Oferta extraída y verificada desde ${portal.label}`}
    >
      {portal.icon}
      {showLabel && <span>{portal.label}</span>}
    </span>
  );
};

