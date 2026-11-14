import React, { useState } from 'react';
import {
  Building2,
  Briefcase,
  DollarSign,
  MapPin,
  Globe,
  Sparkles,
  CheckCircle2,
  CreditCard,
  PlusCircle,
  Eye,
  Rocket,
  ShieldCheck,
  ArrowLeft,
  Share2,
  Clock,
  HelpCircle
} from 'lucide-react';
import { JobCategory, JobOffer, PostJobFormData } from '../types';

interface PublishJobViewProps {
  onBackToJobs: () => void;
  onJobPublished: (newJob: JobOffer) => void;
}

export const PublishJobView: React.FC<PublishJobViewProps> = ({
  onBackToJobs,
  onJobPublished,
}) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company || (!formData.applyUrl && !formData.contactEmail)) {
      alert('Por favor completa al menos el título, la empresa y un enlace o correo de postulación.');
      return;
    }

    setIsSubmitting(true);

    // Simulación de procesamiento seguro B2B
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
        featuredBadge: 'DESTACADA',
        featuredTier: formData.planId === 'plan-30d' ? 'diamond' : 'gold',
        sponsorCompany: formData.company,
      };

      onJobPublished(newJob);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* BARRA SUPERIOR DE RETORNO Y STATUS */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBackToJobs}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-[#2b3345] bg-white dark:bg-[#12151c] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#1c2230] transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Ofertas</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-montserrat font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Portal Empresas & Reclutadores B2B</span>
        </div>
      </div>

      {/* BANNER HERO DE LA PÁGINA */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-neutral-100 dark:via-[#131722] to-amber-500/5 border border-amber-500/30 dark:border-amber-400/20 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <h2 className="font-montserrat text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <PlusCircle className="w-6 h-6 text-amber-500 shrink-0" />
            <span>Publicar Oferta Destacada</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
            Posiciona tu vacante en la posición #1 fija del feed de JoBOT con insignia dorada de Empresa Verificada, máxima prioridad en recomendaciones y alcance directo a miles de candidatos.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-montserrat font-bold text-neutral-700 dark:text-neutral-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Posición #1 en el Feed
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-500" /> Insignia Empresa Verificada
            </span>
            <span className="flex items-center gap-1.5">
              <Rocket className="w-4 h-4 text-amber-500" /> Prioridad de Afinidad ATS
            </span>
          </div>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL DEL FORMULARIO Y VISTA PREVIA */}
      <div className="bg-white dark:bg-[#12151c] rounded-2xl border border-neutral-200 dark:border-[#252a36] shadow-sm overflow-hidden">
        {/* SELECTOR DE PESTAÑAS: FORMULARIO vs VISTA PREVIA */}
        {!isSuccess && (
          <div className="flex border-b border-neutral-200 dark:border-[#222736] px-5 sm:px-6 bg-neutral-50 dark:bg-[#141822]">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`py-3 px-4 text-xs font-montserrat font-black uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                activeTab === 'form'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              1. Formulario de Publicación
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`py-3 px-4 text-xs font-montserrat font-black uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>2. Vista Previa de la Tarjeta Top</span>
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8">
          {isSuccess ? (
            /* PANTALLA DE ÉXITO */
            <div className="py-12 text-center space-y-4 max-w-lg mx-auto animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-[#4ade80] flex items-center justify-center mx-auto text-3xl border-2 border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-montserrat font-black text-neutral-900 dark:text-white">
                ¡Tu Oferta fue Publicada con Éxito!
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                La vacante <span className="font-bold text-neutral-900 dark:text-white">{formData.title}</span> de <span className="font-bold text-neutral-900 dark:text-white">{formData.company}</span> ya se encuentra en el primer lugar del feed con prioridad absoluta de postulación.
              </p>
              <div className="pt-4">
                <button
                  onClick={onBackToJobs}
                  className="px-6 py-3 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider bg-emerald-600 dark:bg-[#4ade80] text-white dark:text-[#070709] hover:opacity-90 shadow-lg cursor-pointer transition-transform active:scale-95"
                >
                  Ver Mi Oferta en el Feed Principal
                </button>
              </div>
            </div>
          ) : activeTab === 'preview' ? (
            /* PESTAÑA: VISTA PREVIA EN VIVO DE LA TARJETA */
            <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Así se verá tu vacante en la posición destacada superior para todos los postulantes:</span>
              </div>

              {/* TARJETA DESTACADA TOP */}
              <div className="rounded-2xl border-2 border-amber-500/60 dark:border-amber-400/50 bg-gradient-to-r from-amber-500/10 via-white to-amber-500/5 dark:from-amber-950/30 dark:via-[#151922] dark:to-amber-950/15 p-5 sm:p-6 shadow-xl relative">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-montserrat font-black uppercase tracking-wider bg-amber-500 text-black shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      DESTACADA
                    </span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      Empresa Verificada
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-[#4ade80]">
                    {formData.salary}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xl shrink-0">
                    {formData.company ? formData.company.charAt(0).toUpperCase() : 'E'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-montserrat font-black text-base text-neutral-900 dark:text-white truncate">
                      {formData.title || 'Título de la Vacante'}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2 mt-1">
                      <span className="font-bold">{formData.company || 'Nombre de la Empresa'}</span>
                      <span>•</span>
                      <span>{formData.modality}</span>
                      <span>•</span>
                      <span>{formData.countryScope}</span>
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {formData.oneLineSummary}
                </p>

                <div className="mt-4 pt-3.5 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Fijada por {formData.planId === 'plan-30d' ? '30 días' : '15 días'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="font-montserrat font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Editar datos del formulario →
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-6 py-2.5 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 cursor-pointer transition-transform active:scale-95"
                >
                  Continuar con la Publicación →
                </button>
              </div>
            </div>
          ) : (
            /* FORMULARIO COMPLETO DE PUBLICACIÓN */
            <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto text-xs">
              {/* 1. SELECCIÓN DE PLANES B2B */}
              <div className="space-y-3">
                <label className="block font-montserrat text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Selecciona el Plan de Destacado B2B
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setFormData({ ...formData, planId: 'plan-15d' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.planId === 'plan-15d'
                        ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                        : 'border-neutral-200 dark:border-[#222736] hover:border-neutral-300 dark:hover:border-[#333b4f]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-montserrat font-black text-sm text-neutral-900 dark:text-white">
                        Destacada 15 Días
                      </span>
                      <span className="text-base font-black text-amber-600 dark:text-amber-400">
                        $19 USD
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Fijada en el TOP del feed con badge dorado y prioridad en el cálculo ATS.
                    </p>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, planId: 'plan-30d' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.planId === 'plan-30d'
                        ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                        : 'border-neutral-200 dark:border-[#222736] hover:border-neutral-300 dark:hover:border-[#333b4f]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-montserrat font-black text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Destacada 30 Días
                      </span>
                      <span className="text-base font-black text-amber-600 dark:text-amber-400">
                        $39 USD
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Prioridad #1 absoluta, mención directa en alertas automáticas de correo.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. DATOS DE LA VACANTE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-montserrat font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Título del Puesto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Senior Frontend Engineer (React/TS)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-montserrat font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Globant / Tech Startup"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 3. PARÁMETROS DE COMPENSACIÓN Y FILTRO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-montserrat font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white"
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
                  <label className="block font-montserrat font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Rango Salarial (USD)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. $3,000 - $4,500 USD"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-montserrat font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Requisito de Idioma
                  </label>
                  <select
                    value={formData.languageReq}
                    onChange={(e) => setFormData({ ...formData, languageReq: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white"
                  >
                    <option value="Español 100%">Español 100%</option>
                    <option value="Inglés Escrito / Técnico">Inglés Escrito / Técnico</option>
                    <option value="Inglés Conversacional">Inglés Conversacional</option>
                  </select>
                </div>
              </div>

              {/* 4. RESUMEN DE 1 LÍNEA */}
              <div>
                <label className="block font-montserrat font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Resumen de una línea (Impacto en el feed)
                </label>
                <input
                  type="text"
                  placeholder="Resumen atractivo que enganche al candidato en el feed"
                  value={formData.oneLineSummary}
                  onChange={(e) => setFormData({ ...formData, oneLineSummary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white"
                />
              </div>

              {/* 5. ENLACES Y FACTURACIÓN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-montserrat font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Enlace de Postulación (o Portal ATS) *
                  </label>
                  <input
                    type="url"
                    placeholder="https://tuempresa.com/careers/puesto"
                    value={formData.applyUrl}
                    onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-montserrat font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Correo para Facturación / Reclutador *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="recruiter@empresa.com"
                    value={formData.billingEmail}
                    onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#161a24] border border-neutral-300 dark:border-[#2a3040] text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 6. BOTÓN DE ENVÍO Y PROCEDER */}
              <div className="pt-4 border-t border-neutral-200 dark:border-[#222736] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  Factura fiscal e inicio inmediato de visibilidad prioritaria
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-montserrat font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black shadow-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  <Rocket className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Procesando...'
                      : `Destacar Oferta por ${formData.planId === 'plan-30d' ? '$39' : '$19'} USD`}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

