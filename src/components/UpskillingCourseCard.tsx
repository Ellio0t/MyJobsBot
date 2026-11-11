import React from 'react';
import { ExternalLink, Award, Sparkles, TrendingUp, BookOpen, Clock } from 'lucide-react';
import { CourseRecommendation } from '../types';

interface UpskillingCourseCardProps {
  course: CourseRecommendation;
  currentMatchScore?: number;
}

export const UpskillingCourseCard: React.FC<UpskillingCourseCardProps> = ({
  course,
  currentMatchScore = 70,
}) => {
  const targetScore = Math.min(98, currentMatchScore + course.estimatedAffinityBoost);

  // Paleta de colores según el proveedor educativo
  const getProviderTheme = (provider: CourseRecommendation['provider']) => {
    switch (provider) {
      case 'Coursera':
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-950/30',
          border: 'border-blue-500/30 dark:border-blue-500/40',
          badge: 'bg-blue-600 text-white',
          text: 'text-blue-600 dark:text-blue-400',
        };
      case 'Platzi':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
          border: 'border-emerald-500/30 dark:border-emerald-500/40',
          badge: 'bg-[#98ca3f] text-[#0c1633]',
          text: 'text-emerald-600 dark:text-[#98ca3f]',
        };
      case 'Open English':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-950/30',
          border: 'border-amber-500/30 dark:border-amber-500/40',
          badge: 'bg-amber-500 text-black',
          text: 'text-amber-600 dark:text-amber-400',
        };
      default:
        return {
          bg: 'bg-purple-500/10 dark:bg-purple-950/30',
          border: 'border-purple-500/30 dark:border-purple-500/40',
          badge: 'bg-purple-600 text-white',
          text: 'text-purple-600 dark:text-purple-400',
        };
    }
  };

  const theme = getProviderTheme(course.provider);

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-4.5 transition-all shadow-xs relative overflow-hidden ${theme.bg} ${theme.border}`}
    >
      {/* Etiqueta superior de afinidad */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-montserrat font-black uppercase tracking-wider ${theme.badge}`}
          >
            {course.provider}
          </span>
          <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Certificado Oficial
          </span>
        </div>

        {/* Simulador de Aumento de Score ATS */}
        <div className="flex items-center gap-1 text-[11px] font-montserrat font-bold text-emerald-700 dark:text-[#4ade80] bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Eleva tu ATS: {currentMatchScore}% → {targetScore}%</span>
        </div>
      </div>

      {/* Título del curso */}
      <h5 className="font-montserrat font-extrabold text-sm text-neutral-900 dark:text-white mb-1.5 leading-snug">
        {course.title}
      </h5>

      {/* Meta información */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-300 mb-3">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 opacity-70" />
          {course.skillName}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 opacity-70" />
          {course.durationHours} hrs de contenido
        </span>
        {course.priceNote && (
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
            • {course.priceNote}
          </span>
        )}
      </div>

      {/* Botón de acción con enlace de afiliado */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200/60 dark:border-white/10">
        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Acceso verificado para candidatos de JoBOT</span>
        </div>

        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-extrabold uppercase tracking-wider bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity shadow-xs shrink-0 cursor-pointer"
        >
          <span>Capacitarme y Certificarme</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

