import React from 'react';
import { Sparkles, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface SponsoredFeedCardProps {
  index: number;
}

export const SponsoredFeedCard: React.FC<SponsoredFeedCardProps> = ({ index }) => {
  // Rotación de creatividades nativas de alto valor para postulantes
  const sponsoredAds = [
    {
      title: 'Cuenta en USD sin comisiones para profesionales remotos en Latam',
      sponsor: 'DolarApp & Wise Partner',
      tagline: 'Recibe tus honorarios del extranjero a tasa interbancaria oficial y con tarjeta internacional.',
      badge: 'Solución Financiera Verificada',
      ctaText: 'Abrir Cuenta Remota Gratis',
      url: 'https://www.dolarapp.com/?ref=jobsbot_native&utm_source=jobsbot&utm_medium=native_feed_ad',
      iconClass: 'ri-bank-card-line text-emerald-500',
    },
    {
      title: 'VPN de Alta Velocidad para Entrevistas y Trabajo Remoto Seguro',
      sponsor: 'NordVPN Security',
      tagline: 'Protege tu conexión y accede a ofertas laborales geolocalizadas en EE.UU. y Europa sin restricciones.',
      badge: 'Herramienta de Seguridad',
      ctaText: 'Obtener Descuento 70%',
      url: 'https://nordvpn.com/?ref=jobsbot_native&utm_source=jobsbot&utm_medium=native_feed_ad',
      iconClass: 'ri-shield-keyhole-line text-blue-500',
    },
    {
      title: 'Simulador de Entrevistas Técnicas con Inteligencia Artificial',
      sponsor: 'InterviewPrep AI',
      tagline: 'Practica preguntas en vivo en inglés y español antes de tu entrevista real con reclutadores de EE.UU.',
      badge: 'Preparación de Candidatos',
      ctaText: 'Probar Simulador Gratis',
      url: 'https://interviewing.io/?ref=jobsbot&utm_source=jobsbot&utm_medium=native_feed_ad',
      iconClass: 'ri-mic-line text-purple-500',
    },
  ];

  const ad = sponsoredAds[index % sponsoredAds.length];

  return (
    <aside
      className="bg-neutral-50/90 dark:bg-[#10131a] rounded-xl border border-dashed border-neutral-300 dark:border-[#282f40] p-3.5 sm:p-5 hover:border-emerald-500/50 transition-all shadow-xs relative overflow-hidden group"
    >
      {/* Etiqueta sutil de Publicidad Nativa Discreta */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-montserrat font-bold uppercase tracking-wider bg-neutral-200 dark:bg-[#1a202c] text-neutral-600 dark:text-neutral-400">
            Patrocinado
          </span>
          <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            {ad.badge}
          </span>
        </div>

        <span className="text-[10px] font-montserrat font-semibold text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" />
          Anuncio Recomendado
        </span>
      </div>

      <div className="flex items-start gap-3">
        {/* Icono del Patrocinador */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-[#181d28] border border-neutral-200 dark:border-[#262c3a] flex items-center justify-center text-xl shrink-0 shadow-xs">
          <i className={ad.iconClass} />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-montserrat font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white leading-snug">
              {ad.title}
            </h4>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
            Por {ad.sponsor}
          </p>
          <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1.5 leading-relaxed">
            {ad.tagline}
          </p>
        </div>
      </div>

      {/* Footer del Anuncio con botón de acción */}
      <div className="mt-3 pt-2.5 border-t border-neutral-200/60 dark:border-white/5 flex items-center justify-between">
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
          Al usar estos servicios apoyas el mantenimiento 100% gratuito de JoBOT
        </span>

        <a
          href={ad.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider bg-neutral-900 dark:bg-[#202534] text-white dark:text-[#4ade80] hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
        >
          <span>{ad.ctaText}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};
