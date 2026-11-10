import React, { useState } from 'react';
import { JobCategory } from '../types';

interface CompanyLogoProps {
  logoUrl?: string;
  companyName: string;
  category?: JobCategory;
  sizeClass?: string;
}

/**
 * Mapeo de iconos temáticos Font Awesome por área laboral
 * cuando la empresa no cuenta con logotipo corporativo verificado
 */
export function getCategoryIconConfig(category?: JobCategory) {
  switch (category) {
    case 'qa':
      return {
        iconClass: 'fa-solid fa-shield-halved',
        colorClass: 'text-emerald-500 dark:text-[#4ade80]',
        bgClass: 'bg-emerald-500/10 border-emerald-500/25 dark:border-[#4ade80]/30',
        label: 'Aseguramiento de Calidad & QA',
      };
    case 'data':
      return {
        iconClass: 'fa-solid fa-database',
        colorClass: 'text-sky-500 dark:text-sky-400',
        bgClass: 'bg-sky-500/10 border-sky-500/25 dark:border-sky-500/30',
        label: 'Datos & Contenido',
      };
    case 'ops':
      return {
        iconClass: 'fa-solid fa-table-list',
        colorClass: 'text-amber-500 dark:text-amber-400',
        bgClass: 'bg-amber-500/10 border-amber-500/25 dark:border-amber-500/30',
        label: 'Operaciones & Procesos',
      };
    case 'support':
      return {
        iconClass: 'fa-solid fa-headset',
        colorClass: 'text-indigo-500 dark:text-indigo-400',
        bgClass: 'bg-indigo-500/10 border-indigo-500/25 dark:border-indigo-500/30',
        label: 'Soporte al Cliente & Helpdesk',
      };
    case 'tech':
      return {
        iconClass: 'fa-solid fa-laptop-code',
        colorClass: 'text-violet-500 dark:text-violet-400',
        bgClass: 'bg-violet-500/10 border-violet-500/25 dark:border-violet-500/30',
        label: 'Tecnología & Software',
      };
    default:
      return {
        iconClass: 'fa-solid fa-briefcase',
        colorClass: 'text-emerald-500 dark:text-[#4ade80]',
        bgClass: 'bg-emerald-500/10 border-emerald-500/25 dark:border-[#4ade80]/30',
        label: 'Vacante Verificada',
      };
  }
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  logoUrl,
  companyName,
  category,
  sizeClass = 'w-11 h-11 sm:w-12 sm:h-12',
}) => {
  const [error, setError] = useState(false);

  // Detectamos si es un avatar sintético genérico (como ui-avatars.com) o si falló la carga
  const isSyntheticAvatar = !logoUrl || logoUrl.includes('ui-avatars.com') || error;
  const config = getCategoryIconConfig(category);

  // Fallback 1: Si no tiene logo o es sintético, mostramos el icono Font Awesome temático del área
  if (isSyntheticAvatar) {
    return (
      <div
        className={`${sizeClass} rounded-2xl border ${config.bgClass} flex items-center justify-center shrink-0 shadow-xs select-none transition-transform group-hover:scale-105`}
        title={`${companyName} • ${config.label}`}
      >
        <i className={`${config.iconClass} ${config.colorClass} text-lg sm:text-xl drop-shadow-xs`} />
      </div>
    );
  }

  // Logotipo Corporativo Real:
  // Estándar Squircle uniforme (rounded-2xl) con fondo limpio y padding para que ningún logo
  // redondo o cuadrado se deforme o se corte en las esquinas.
  return (
    <div
      className={`${sizeClass} rounded-2xl border border-neutral-200/90 dark:border-[#2b313f] bg-white dark:bg-[#161a24] flex items-center justify-center overflow-hidden shrink-0 shadow-xs p-1.5 transition-transform group-hover:scale-105`}
      title={companyName}
    >
      <img
        src={logoUrl}
        alt={companyName}
        className="w-full h-full object-contain drop-shadow-2xs"
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
};
