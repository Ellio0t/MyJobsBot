import { CVProfile, CVVersion, JobOffer } from '../types';
import SNAPSHOT_JOBS from '../data/liveJobsSnapshot.json';

/**
 * Calcula el porcentaje de compatibilidad ATS entre la versión activa del CV y una oferta laboral
 */
export function calculateAtsMatch(cv: CVProfile, job: JobOffer): number {
  if (!cv || !cv.headline) return 70;

  const cvCorpus = [
    cv.headline,
    cv.summary,
    ...cv.skills.map((s) => s.name),
    ...cv.atsKeywords,
    ...cv.experiences.flatMap((e) => [e.role, ...e.bullets]),
  ]
    .join(' ')
    .toLowerCase();

  let matched = 0;
  const totalKeywords = job.keywords.length || 1;

  for (const kw of job.keywords) {
    const cleanKw = kw.toLowerCase().trim();
    if (cvCorpus.includes(cleanKw)) {
      matched += 1;
    } else {
      const parts = cleanKw.split(/\s+/);
      if (parts.some((p) => p.length > 3 && cvCorpus.includes(p))) {
        matched += 0.65;
      }
    }
  }

  const rawPercent = Math.round(58 + (matched / totalKeywords) * 40);
  return Math.min(99, Math.max(62, rawPercent));
}

/**
 * Consulta en paralelo múltiples APIs públicas de empleos:
 * 1. Get on Board Public API
 * 2. Remotive Public API (CORS Friendly)
 * 3. Fallback inteligente a vacantes curadas
 */
export async function fetchLiveJobsFromApis(searchQuery = 'remote'): Promise<JobOffer[]> {
  const aggregated: JobOffer[] = [];
  const q = searchQuery.trim();

  // 0. SNAPSHOT INDEXADO POR BACKEND/CRON (Google Jobs, LinkedIn, Indeed, Remotive)
  if (Array.isArray(SNAPSHOT_JOBS) && SNAPSHOT_JOBS.length > 0) {
    aggregated.push(...(SNAPSHOT_JOBS as JobOffer[]));
  }

  // 1. GET ON BOARD API (A través del proxy local en dev o directo en prod)
  try {
    const isLocal =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const gobEndpoint = isLocal
      ? `/api/getonbrd/search/jobs?query=${encodeURIComponent(q || 'junior')}&per_page=25`
      : `https://www.getonbrd.com/api/v0/search/jobs?query=${encodeURIComponent(q || 'junior')}&per_page=25`;

    const gobRes = await fetch(gobEndpoint, {
      headers: { 'Accept': 'application/json' },
    });

    if (gobRes.ok) {
      const json = await gobRes.json();
      if (Array.isArray(json.data)) {
        for (const item of json.data) {
          const attr = item.attributes;
          if (!attr) continue;

          const cleanDesc = (attr.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const cleanFunc = (attr.functions || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const combined = `${attr.title} ${cleanDesc} ${cleanFunc}`;

          const emailMatch = combined.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          const phoneMatch = combined.match(/\+?\d{10,14}/);

          const companyName = attr.company?.data?.attributes?.name || 'Empresa Get on Board';
          const logoUrl = attr.company?.data?.attributes?.logo_url || undefined;

          const salaryText =
            attr.min_salary && attr.max_salary
              ? `$${attr.min_salary} - $${attr.max_salary} ${attr.currency || 'USD'} / mes`
              : 'A convenir (USD)';

          const oneLine =
            cleanFunc.length > 20
              ? cleanFunc.slice(0, 320) + '...'
              : cleanDesc.length > 20
              ? cleanDesc.slice(0, 320) + '...'
              : `Posición verificada en modalidad ${attr.remote_modality || 'remota'}.`;

          const lower = combined.toLowerCase();
          let cat: JobOffer['category'] = 'tech';
          if (lower.includes('qa') || lower.includes('calidad') || lower.includes('test')) cat = 'qa';
          else if (lower.includes('data') || lower.includes('datos') || lower.includes('content') || lower.includes('excel'))
            cat = 'data';
          else if (lower.includes('soporte') || lower.includes('support') || lower.includes('helpdesk')) cat = 'support';
          else if (lower.includes('operaciones') || lower.includes('operations') || lower.includes('asistente')) cat = 'ops';

          const isEnglishHeavy =
            lower.includes('fluent english') || lower.includes('advanced english') || lower.includes('c1');
          const langReq: JobOffer['languageReq'] = isEnglishHeavy
            ? 'Inglés Conversacional'
            : lower.includes(' the ') && lower.includes(' and ')
            ? 'Inglés Escrito / Técnico'
            : 'Español 100%';

          aggregated.push({
            id: `gob-${item.id}`,
            title: attr.title,
            company: companyName,
            companyLogo: logoUrl,
            category: cat,
            salary: salaryText,
            modality: attr.remote_modality === 'fully_remote' ? '100% Remoto (Global)' : 'Remoto Regional',
            countryScope:
              attr.remote_modality === 'fully_remote'
                ? 'Global / Sin bloqueo'
                : attr.remote_zone || 'LATAM',
            languageReq: langReq,
            oneLineSummary: oneLine,
            description: cleanDesc || oneLine,
            requirements: ['Validado vía Get on Board'],
            keywords: attr.title
              .split(/[\s,/()-]+/)
              .filter((w: string) => w.length > 2)
              .slice(0, 7),
            source: 'Get on Board',
            applyUrl: attr.links?.public_url || `https://www.getonbrd.com/jobs/${item.id}`,
            contactEmail: emailMatch ? emailMatch[0] : undefined,
            contactWhatsapp: phoneMatch ? phoneMatch[0].replace(/\D/g, '') : undefined,
            publishedAt: 'En vivo',
          });
        }
      }
    }
  } catch (err) {
    console.warn('Get on Board API fetch skipped:', err);
  }

  // 2. REMOTIVE API (Soporta CORS nativo directo desde el navegador en producción)
  try {
    const remotiveUrl = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(q || 'qa')}&limit=30`;
    const remRes = await fetch(remotiveUrl);

    if (remRes.ok) {
      const remJson = await remRes.json();
      if (Array.isArray(remJson.jobs)) {
        for (const rJob of remJson.jobs) {
          const cleanDesc = (rJob.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const emailMatch = cleanDesc.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

          const lower = `${rJob.title} ${cleanDesc}`.toLowerCase();
          let cat: JobOffer['category'] = 'tech';
          if (lower.includes('qa') || lower.includes('test') || lower.includes('quality')) cat = 'qa';
          else if (lower.includes('data') || lower.includes('excel') || lower.includes('writer')) cat = 'data';
          else if (lower.includes('support') || lower.includes('customer')) cat = 'support';
          else if (lower.includes('operations') || lower.includes('admin') || lower.includes('assistant')) cat = 'ops';

          aggregated.push({
            id: `remotive-${rJob.id}`,
            title: rJob.title,
            company: rJob.company_name || 'Empresa Verificada Remotive',
            companyLogo: rJob.company_logo || undefined,
            category: cat,
            salary: rJob.salary || '$1,500 - $3,000 USD',
            modality: '100% Remoto (Worldwide)',
            countryScope: rJob.candidate_required_location || 'Global / Worldwide',
            languageReq: 'Inglés Escrito / Técnico',
            oneLineSummary:
              cleanDesc.length > 20
                ? cleanDesc.slice(0, 320) + '...'
                : `Oportunidad remota en ${rJob.company_name}.`,
            description: cleanDesc,
            requirements: ['Validado vía Remotive (Worldwide)'],
            keywords: (rJob.tags || []).slice(0, 6),
            source: 'Remotive',
            applyUrl: rJob.url,
            contactEmail: emailMatch ? emailMatch[0] : undefined,
            publishedAt: 'En vivo',
          });
        }
      }
    }
  } catch (err) {
    console.warn('Remotive API fetch skipped:', err);
  }

  // 3. JSEARCH API (Pasarela oficial de Google Jobs / LinkedIn / Indeed vía RapidAPI)
  const rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  if (rapidApiKey) {
    try {
      const jsearchUrl = `https://jsearch.p.rapidapi.com/search-v2?query=${encodeURIComponent(
        q || 'developer'
      )}&num_pages=1`;

      const jRes = await fetch(jsearchUrl, {
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        },
      });

      if (jRes.ok) {
        const jJson = await jRes.json();
        const rawJobs = Array.isArray(jJson.data?.jobs)
          ? jJson.data.jobs
          : Array.isArray(jJson.data)
          ? jJson.data
          : [];

        for (const item of rawJobs) {
          const cleanDesc = (item.job_description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const lower = `${item.job_title} ${cleanDesc}`.toLowerCase();

          let cat: JobOffer['category'] = 'tech';
          if (lower.includes('medico') || lower.includes('médic') || lower.includes('doctor') || lower.includes('salud') || lower.includes('enfermer') || lower.includes('clínic') || lower.includes('psicol') || lower.includes('terap'))
            cat = 'health';
          else if (lower.includes('abogad') || lower.includes('legal') || lower.includes('jurid') || lower.includes('juríd') || lower.includes('derecho') || lower.includes('compliance'))
            cat = 'legal';
          else if (lower.includes('contad') || lower.includes('finanz') || lower.includes('accountant') || lower.includes('auditor') || lower.includes('fiscal') || lower.includes('tributar'))
            cat = 'finance';
          else if (lower.includes('ventas') || lower.includes('sales') || lower.includes('comercial') || lower.includes('marketing') || lower.includes('growth'))
            cat = 'sales';
          else if (lower.includes('qa') || lower.includes('test') || lower.includes('quality') || lower.includes('tester'))
            cat = 'qa';
          else if (lower.includes('data') || lower.includes('datos') || lower.includes('excel') || lower.includes('analytics'))
            cat = 'data';
          else if (lower.includes('support') || lower.includes('soporte') || lower.includes('customer') || lower.includes('atencion'))
            cat = 'support';
          else if (lower.includes('operations') || lower.includes('operaciones') || lower.includes('admin') || lower.includes('logistica'))
            cat = 'ops';

          let salary = item.job_salary_string || 'A convenir (USD)';
          if (item.job_min_salary && item.job_max_salary) {
            salary = `$${item.job_min_salary.toLocaleString()} - $${item.job_max_salary.toLocaleString()} ${item.job_salary_currency || 'USD'}`;
          }

          const applyLink = item.job_apply_link || '';
          const publisherRaw = (item.job_publisher || '').trim();
          const pubLower = publisherRaw.toLowerCase();
          let src: JobOffer['source'] = publisherRaw || 'ZipRecruiter';
          if (pubLower.includes('linkedin') || applyLink.includes('linkedin.com')) src = 'LinkedIn';
          else if (pubLower.includes('indeed') || applyLink.includes('indeed.com')) src = 'Indeed';
          else if (pubLower.includes('glassdoor') || applyLink.includes('glassdoor.com')) src = 'Glassdoor';
          else if (pubLower.includes('ziprecruiter') || applyLink.includes('ziprecruiter.com')) src = 'ZipRecruiter';
          else if (pubLower.includes('monster') || applyLink.includes('monster.com')) src = 'Monster';
          else if (pubLower.includes('flexjobs') || applyLink.includes('flexjobs.com')) src = 'FlexJobs';
          else if (pubLower.includes('wellfound') || pubLower.includes('angel') || applyLink.includes('wellfound.com')) src = 'Wellfound';
          else if (pubLower.includes('dice') || applyLink.includes('dice.com')) src = 'Dice';
          else if (pubLower.includes('talent') || applyLink.includes('talent.com')) src = 'Talent.com';
          else if (pubLower.includes('jobleads') || applyLink.includes('jobleads.com')) src = 'JobLeads';
          else if (src.toLowerCase().includes('google')) src = 'ZipRecruiter';

          const emailMatch = cleanDesc.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

          aggregated.push({
            id: `jsearch-${item.job_id}`,
            title: item.job_title,
            company: item.employer_name || 'Empresa Confidencial',
            companyLogo: item.employer_logo || undefined,
            category: cat,
            salary,
            modality: item.job_is_remote ? '100% Remoto (Global)' : (item.job_location || 'Híbrido / Presencial'),
            countryScope: item.job_country || (item.job_is_remote ? 'Global' : 'Local'),
            languageReq: lower.includes('fluent english') || lower.includes('advanced english')
              ? 'Inglés Conversacional'
              : lower.includes(' the ') && lower.includes(' and ')
              ? 'Inglés Escrito / Técnico'
              : 'Español 100%',
            oneLineSummary: cleanDesc.length > 20 ? cleanDesc.slice(0, 320) + '...' : `Posición en ${item.employer_name}.`,
            description: cleanDesc,
            requirements: item.job_highlights?.Qualifications || item.job_required_skills || ['Verificado vía ' + src],
            keywords: (item.job_required_skills || []).slice(0, 7),
            source: src,
            applyUrl: applyLink || `https://www.google.com/search?q=${encodeURIComponent(item.job_title + ' ' + item.employer_name + ' jobs')}`,
            contactEmail: emailMatch ? emailMatch[0] : undefined,
            publishedAt: 'En vivo (' + src + ')',
          });
        }
      }
    } catch (err) {
      console.warn('JSearch API fetch skipped:', err);
    }
  }

  // Deduplicación inteligente por clave única (empresa + título normalizado)
  const seen = new Set<string>();
  const deduplicated: JobOffer[] = [];
  for (const job of aggregated) {
    const key = `${job.company.toLowerCase().trim()}_${job.title.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(job);
    }
  }

  return deduplicated;
}

/**
 * Genera el asunto y cuerpo de correo o mensaje de WhatsApp optimizado según la vacante y el CV activo
 */
export function generateOutreachDraft(cv: CVProfile, job: JobOffer) {
  const isEnglish = job.languageReq !== 'Español 100%' && (job.description.includes(' the ') || job.title.includes('Specialist'));

  if (isEnglish) {
    const subject = `Application: ${job.title} — ${cv.fullName} (ATS Verified Profile)`;
    const body = `Dear ${job.company} Hiring Team,

I am writing to apply for the ${job.title} position. Having reviewed your requirements ("${job.oneLineSummary}"), my professional background aligns directly with your goals.

Key highlights from my profile:
• Core Focus: ${cv.skills.slice(0, 4).map((s) => s.name).join(', ')}.
• Recent Experience: ${cv.experiences[0]?.role || 'Professional Specialist'} (${cv.experiences[0]?.period || '2023-Present'}).
• Availability: ${cv.availability}.

I have attached my updated ATS-optimized CV (PDF) tailored specifically for ${job.company}. I am available for any technical assessment or asynchronous evaluation.

Best regards,
${cv.fullName}
Email: ${cv.email}
Phone / WhatsApp: ${cv.phone}
LinkedIn: ${cv.linkedin}`;

    const whatsappText = `Hello ${job.company} team! 👋 My name is ${cv.fullName}. I am applying for the *${job.title}* remote position. My profile has a high match in ${cv.skills
      .slice(0, 3)
      .map((s) => s.name)
      .join(', ')}. I have my tailored CV ready to share. Where can I forward my PDF?`;

    return { subject, body, whatsappText };
  }

  const subject = `Postulación: ${job.title} — ${cv.fullName} (Disponibilidad Inmediata 100% Remoto)`;
  const body = `Estimado equipo de selección de ${job.company},

Les escribo con entusiasmo para presentar mi postulación a la vacante de ${job.title}. Tras analizar el alcance del puesto ("${job.oneLineSummary}"), cuento con la experiencia práctica y el rigor para aportar valor desde el primer día.

Puntos clave de mi perfil alineados con su búsqueda:
• Especialidad: ${cv.skills.slice(0, 4).map((s) => s.name).join(', ')}.
• Experiencia reciente: ${cv.experiences[0]?.role || 'Especialista'} (${cv.experiences[0]?.period || '2023 - Presente'}).
• Modalidad y Disponibilidad: ${cv.availability}.

Adjunto a este correo mi Currículum Vitae actualizado en formato PDF (optimizado bajo estándar ejecutivo ATS). Quedo a su entera disposición para cualquier prueba técnica o entrevista.

Atentamente,
${cv.fullName}
Correo: ${cv.email}
Teléfono / WhatsApp: ${cv.phone}
LinkedIn: ${cv.linkedin}`;

  const whatsappText = `¡Hola equipo de *${job.company}*! 👋 Mi nombre es *${cv.fullName}*. Les escribo por la vacante de *${job.title}*. Cuento con experiencia directa en ${cv.skills
    .slice(0, 3)
    .map((s) => s.name)
    .join(', ')} y disponibilidad inmediata 100% remota. Les comparto mi CV optimizado en PDF por esta vía.`;

  return { subject, body, whatsappText };
}

/**
 * JoBOT — Motor Proactivo de IA:
 * Analiza vacantes, detecta vacíos de palabras clave y crea versiones optimizadas en tiempo real.
 */
export function createTailoredCvVersion(
  baseVersion: CVVersion,
  promptOrJob: string | JobOffer,
  existingCount: number
): { newVersion: CVVersion; explanation: string } {
  const base = JSON.parse(JSON.stringify(baseVersion.profile)) as CVProfile;

  if (typeof promptOrJob !== 'string') {
    const job = promptOrJob;
    const isEn = job.languageReq !== 'Español 100%';
    base.headline = `${job.title} | ${base.skills.slice(0, 3).map((s) => s.name).join(' • ')}`;
    base.atsKeywords = Array.from(new Set([...job.keywords, ...base.atsKeywords]));

    base.skills = [
      ...job.keywords.slice(0, 3).map((kw) => ({ name: `${kw} (Requerimiento Clave)`, level: 96 })),
      ...base.skills.slice(0, 5),
    ];

    if (isEn) {
      base.showPhotoInCV = false; // Formato ATS EE. UU. sin foto
    }

    const newVer: CVVersion = {
      id: `cv-custom-${Date.now()}`,
      label: `CV #${existingCount + 1}: Adaptado a ${job.company}`,
      targetRole: job.title,
      createdAt: 'Generado por JoBOT Proactivo',
      profile: base,
    };

    return {
      newVersion: newVer,
      explanation: `He analizado la vacante de ${job.company}. Inyecté las palabras clave exactas que buscan sus filtros (${job.keywords.join(
        ', '
      )}), optimicé tu titular a "${job.title}" y ${
        isEn ? 'desactivé la fotografía para cumplir la normativa ATS de EE. UU.' : 'mantuve tu avatar profesional'
      }. ¿Quieres que redacte también una carta de presentación para esta empresa?`,
    };
  }

  const lower = promptOrJob.toLowerCase();

  if (lower.includes('data entry') || lower.includes('excel') || lower.includes('operaciones') || lower.includes('catalogo')) {
    base.headline =
      'Especialista en Data Entry, Gestión de Catálogos, Excel/Google Sheets Avanzado & Operaciones de Backoffice';
    base.summary =
      'Especialista enfocado en precisión operativa, digitación de alta velocidad, limpieza de planillas Excel/Google Sheets, administración de catálogos web y ejecución de procedimientos estandarizados (SOP) con cero margen de error.';
    base.skills = [
      { name: 'Data Entry & Digitación de Precisión', level: 99 },
      { name: 'Microsoft Excel & Google Sheets Avanzado', level: 96 },
      { name: 'Gestión de Catálogos & Publicación Web CMS', level: 94 },
      { name: 'Limpieza de Datos (CSV/JSON) & Control de Calidad', level: 95 },
      { name: 'Resolución de Tickets & Procedimientos SOP', level: 93 },
    ];
    base.atsKeywords = [
      'Data Entry',
      'Microsoft Excel',
      'Google Sheets',
      'WordPress',
      'Backoffice',
      'Catalog Management',
      'SOP',
      'Quality Control',
      'Typing',
    ];
  } else if (lower.includes('qa') || lower.includes('calidad') || lower.includes('test') || lower.includes('bug')) {
    base.headline = 'Analista de Aseguramiento de Calidad (QA Web & AI) | Pruebas Funcionales, APIs & Reporte de Bugs';
    base.summary =
      'Analista de QA y Auditoría de Software especializado en pruebas funcionales extremo a extremo, validación de APIs REST, evaluación de bots conversacionales (LLMs), diseño de casos de prueba y documentación estructurada de incidencias.';
    base.skills = [
      { name: 'Pruebas Funcionales, Regresión & UI/UX Web', level: 97 },
      { name: 'Auditoría de Conversaciones IA & SOP Compliance', level: 95 },
      { name: 'Validación de APIs REST (Postman / JSON)', level: 92 },
      { name: 'Reporte y Trazabilidad de Bugs (Jira/Monday/Excel)', level: 96 },
      { name: 'Automatización de Flujos y Testing', level: 90 },
    ];
  } else if (lower.includes('sin foto') || lower.includes('ocultar foto') || lower.includes('ats usa')) {
    base.showPhotoInCV = false;
  } else if (lower.includes('con foto') || lower.includes('mostrar foto')) {
    base.showPhotoInCV = true;
  } else {
    base.headline = `${base.headline.split('|')[0].trim()} | Enfoque: ${promptOrJob.slice(0, 48)}`;
    base.atsKeywords = [promptOrJob.slice(0, 25), ...base.atsKeywords];
  }

  const labelShort = promptOrJob.length > 24 ? promptOrJob.slice(0, 24) + '...' : promptOrJob;

  const newVer: CVVersion = {
    id: `cv-chat-${Date.now()}`,
    label: `CV #${existingCount + 1}: ${labelShort}`,
    targetRole: promptOrJob,
    createdAt: 'Creado por JoBOT',
    profile: base,
  };

  return {
    newVersion: newVer,
    explanation: `¡Listo! He generado la versión "${newVer.label}". Reorganicé tus habilidades prioritarias y actualicé los metadatos para indexación robótica. Ya puedes descargarla en PDF limpio o verla en pantalla.`,
  };
}
