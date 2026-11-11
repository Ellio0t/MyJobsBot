import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Briefcase,
  DollarSign,
  MapPin,
  Globe,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Crown,
  Eye,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { JobCategory, JobOffer, PostJobFormData } from '../types';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobPublished: (newJob: JobOffer) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  onJobPublished,
}) => {
  // BLOQUEO ESTRICTO DE SCROLL DE FONDO
  useEffect(() => {
    if (!isOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen]);

  const [formData, setFormData] = useState<PostJobFormData>({
    title: '',
    company: '',
    companyLogo: '',
    category: 'tech',
    salary: '$2,500 - $4,200 USD/mes',
    modality: '100% Remoto (Latam / Global)',
    countryScope: 'Latam / Global',
    languageReq: 'Inglés Conversacional',
    oneLineSummary: 'Buscamos talento para acelerar el desarrollo de nuestra plataforma de escala global.',
    description: 'Estamos en búsqueda de un profesional apasionado por construir soluciones de alto impacto...',
    requirements: '3+ años de experiencia relevante\nDominio de buenas prácticas y arquitectura moderna\nCapacidad de comunicación asíncrona',
    keywords: 'React, TypeScript, Node.js, Cloud, CI/CD',
    applyUrl: '',
    contactEmail: '',
    contactWhatsapp: '',
    planId: 'plan-15d',
    billingEmail: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company || (!formData.applyUrl && !formData.contactEmail)) {
      alert('Por favor completa al menos el título, la empresa y un enlace o correo de postulación.');
      return;
    }

    setIsSubmitting(true);

    // Simulación de procesamiento seguro de pasarela B2B
    setTimeout(() => {
      const newJob: JobOffer = {
        id: `featured-${Date.now()}`,
        title: formData.title,
        company: formData.company,
        companyLogo: formData.companyLogo || undefined,
        category: formData.category,
        salary: formData.salary,
        modality: formData.modality,
        countryScope: formData.countryScope,
        languageReq: formData.languageReq,
        oneLineSummary: formData.oneLineSummary,
        description: formData.description,
        requirements: formData.requirements.split('\n').filter(Boolean),
        keywords: formData.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        source: 'JoBOT Destacados B2B',
        applyUrl: formData.applyUrl || `mailto:${formData.contactEmail}`,
        contactEmail: formData.contactEmail,
        contactWhatsapp: formData.contactWhatsapp,
        publishedAt: 'Hoy (Destacada)',
        isFeatured: true,
        featuredBadge: formData.planId === 'plan-30d' ? 'VIP DIAMOND' : 'PATROCINADA',
        featuredTier: formData.planId === 'plan-30d' ? 'diamond' : 'gold',
        sponsorCompany: formData.company,
      };

      onJobPublished(newJob);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overscroll-contain animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-[#11141c] border border-neutral-200 dark:border-[#222736] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Cabecera Modal */}
        <header className="px-5 py-4 border-b border-neutral-200 dark:border-[#222736] flex items-center justify-between bg-neutral-50/70 dark:bg-[#151924]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-montserrat font-black text-sm sm:text-base text-neutral-900 dark:text-white flex items-center gap-2">
                Publicar Oferta Destacada (B2B)
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Empresas & Reclutadores
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Llega a miles de candidatos calificados en el primer lugar de JoBOT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#202534] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Selector de Pestañas Form / Preview */}
        {!isSuccess && (
          <div className="flex border-b border-neutral-200 dark:border-[#222736] px-5 bg-neutral-100/50 dark:bg-[#131620]">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`py-2.5 px-4 text-xs font-montserrat font-bold border-b-2 transition-colors ${
                activeTab === 'form'
                  ? 'border-emerald-500 text-emerald-600 dark:text-[#4ade80]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              1. Datos de la Vacante & Plan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`py-2.5 px-4 text-xs font-montserrat font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'preview'
                  ? 'border-emerald-500 text-emerald-600 dark:text-[#4ade80]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              2. Vista Previa de la Tarjeta Top
            </button>
          </div>
        )}

        {/* Cuerpo del Modal */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-[#4ade80] flex items-center justify-center mx-auto text-2xl border-2 border-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-lg font-montserrat font-black text-neutral-900 dark:text-white">
                ¡Tu Oferta fue Destacada Exitosamente!
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
                La vacante ya se encuentra fijada en el tope del listado de JoBOT con insignia dorada de empresa verificada.
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider bg-emerald-600 dark:bg-[#4ade80] text-white dark:text-[#070709] hover:opacity-90 shadow-md cursor-pointer"
                >
                  Ver Mi Oferta en el Feed
                </button>
              </div>
            </div>
          ) : activeTab === 'preview' ? (
            /* Vista Previa en Vivo de la Tarjeta */
            <div className="space-y-4">
              <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                Así se verá tu oferta fijada en la primera posición para todos los usuarios:
              </p>

              <div className="rounded-xl border-2 border-amber-500/50 dark:border-amber-400/50 bg-gradient-to-r from-amber-500/5 via-white to-amber-500/5 dark:from-amber-950/20 dark:via-[#151922] dark:to-amber-950/10 p-4 sm:p-5 shadow-lg relative">
                {/* Badge Top */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-montserrat font-black uppercase tracking-wider bg-amber-500 text-black shadow-xs">
                      <Crown className="w-3 h-3" />
                      {formData.planId === 'plan-30d' ? 'VIP DIAMOND' : 'PATROCINADA'}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Empresa Verificada
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-[#4ade80]">
                    {formData.salary}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {formData.company ? formData.company.charAt(0).toUpperCase() : 'E'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-montserrat font-black text-sm text-neutral-900 dark:text-white truncate">
                      {formData.title || 'Título del Puesto'}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span className="font-bold">{formData.company || 'Nombre de Empresa'}</span>
                      <span>•</span>
                      <span>{formData.modality}</span>
                      <span>•</span>
                      <span>{formData.countryScope}</span>
                    </p>
                  </div>
                </div>

                <p className="mt-2.5 text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2">
                  {formData.oneLineSummary}
                </p>

                <div className="mt-3 pt-3 border-t border-neutral-200/60 dark:border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Fijada en la primera posición por {formData.planId === 'plan-30d' ? '30 días' : '15 días'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="text-xs font-bold text-emerald-600 dark:text-[#4ade80] underline cursor-pointer"
                  >
                    Editar datos
                  </button>
                </div>
              </div>

              {/* Botón rápido para proceder */}
              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-5 py-2 rounded-xl font-montserrat font-bold text-xs uppercase bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 cursor-pointer"
                >
                  Continuar al Pago y Publicación →
                </button>
              </div>
            </div>
          ) : (
            /* Formulario Principal */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selección de Planes B2B */}
              <div>
                <label className="block font-montserrat font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Selecciona el Plan de Destacado B2B
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, planId: 'plan-15d' })}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.planId === 'plan-15d'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-neutral-200 dark:border-[#222736] hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-montserrat font-black text-sm text-neutral-900 dark:text-white">
                        Destacada 15 Días
                      </span>
                      <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                        $19 USD
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Fijada en el TOP del feed con badge dorado y prioridad en el cálculo ATS.
                    </p>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, planId: 'plan-30d' })}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.planId === 'plan-30d'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-neutral-200 dark:border-[#222736] hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-montserrat font-black text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-500" />
                        VIP 30 Días
                      </span>
                      <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                        $39 USD
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Prioridad #1 absoluta, mención directa en alertas automáticas de WhatsApp y correo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Datos de la Oferta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Título de la Vacante *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Senior Frontend Engineer (React/TS)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Globant / Startup Tech"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white"
                  >
                    <option value="tech">Tecnología & Dev</option>
                    <option value="qa">QA & Testing</option>
                    <option value="data">Datos & Analytics</option>
                    <option value="sales">Ventas & Clientes</option>
                    <option value="finance">Finanzas & Contabilidad</option>
                    <option value="legal">Legal & Compliance</option>
                    <option value="health">Salud & Bienestar</option>
                    <option value="ops">Operaciones & Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Rango Salarial
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. $3,000 - $4,500 USD"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Requisito de Idioma
                  </label>
                  <select
                    value={formData.languageReq}
                    onChange={(e) =>
                      setFormData({ ...formData, languageReq: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white"
                  >
                    <option value="Español 100%">Español 100%</option>
                    <option value="Inglés Escrito / Técnico">Inglés Escrito / Técnico</option>
                    <option value="Inglés Conversacional">Inglés Conversacional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Resumen de una línea
                </label>
                <input
                  type="text"
                  placeholder="Resumen atractivo que enganche al candidato en el feed"
                  value={formData.oneLineSummary}
                  onChange={(e) => setFormData({ ...formData, oneLineSummary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Enlace de Postulación (o ATS) *
                  </label>
                  <input
                    type="url"
                    placeholder="https://tuempresa.com/careers/puesto"
                    value={formData.applyUrl}
                    onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Correo para Facturación / Reclutador *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="recruiter@empresa.com"
                    value={formData.billingEmail}
                    onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Botón de envío */}
              <div className="pt-2 border-t border-neutral-200 dark:border-[#222736] flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  Factura fiscal e inicio inmediato de visibilidad
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black shadow-md cursor-pointer transition-all disabled:opacity-50"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Procesando...' : `Destacar por ${formData.planId === 'plan-30d' ? '$39' : '$19'} USD`}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

