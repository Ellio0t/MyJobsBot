import { JobOffer } from '../types';

/**
 * MOTOR DE AFILIACIÓN DE EMPLEO (VÍA A: CPC / CPA)
 * 
 * Este módulo procesa todas las URLs de postulación salientes agregando
 * de manera transparente las credenciales de afiliado (Publisher IDs, SubIDs, UTMs)
 * para monetizar cada clic saliente (CPC: $0.10 - $0.80) y postulación (CPA: $3 - $12).
 */

const STORAGE_KEY_AFFILIATE_CLICKS = 'jobsbot_affiliate_click_events_v1';

// Parámetros y tokens de afiliados oficiales
export const AFFILIATE_CONFIG = {
  defaultPublisherId: 'jobsbot_partner',
  campaignName: 'jobsbot_app_traffic',
  sources: {
    indeed: {
      publisherId: 'job_pub_84920482',
      utmSource: 'jobsbot',
      utmMedium: 'affiliate_cpc',
    },
    ziprecruiter: {
      partnerId: 'zip_partner_jobsbot_latam',
      utmSource: 'jobsbot',
      utmMedium: 'affiliate_cpc',
    },
    jooble: {
      affiliateId: 'jooble_aff_jobsbot',
      utmSource: 'jobsbot',
      utmMedium: 'cpc_network',
    },
    talent: {
      partnerId: 'talent_com_jobsbot',
      utmSource: 'jobsbot',
      utmMedium: 'aggregator_partner',
    },
    remotive: {
      refId: 'jobsbot',
      utmSource: 'jobsbot',
    },
    getonboard: {
      refId: 'jobsbot_talent',
      utmSource: 'jobsbot',
    },
  },
};

/**
 * Inyecta parámetros de tracking y tokens de afiliación a cualquier URL de oferta
 */
export function buildAffiliateApplyUrl(job: JobOffer): string {
  if (!job.applyUrl) return '#';

  try {
    const parsed = new URL(job.applyUrl);
    const host = parsed.hostname.toLowerCase();

    // 1. Detección de portales principales de afiliados
    if (host.includes('indeed.')) {
      parsed.searchParams.set('pub', AFFILIATE_CONFIG.sources.indeed.publisherId);
      parsed.searchParams.set('utm_source', AFFILIATE_CONFIG.sources.indeed.utmSource);
      parsed.searchParams.set('utm_medium', AFFILIATE_CONFIG.sources.indeed.utmMedium);
      parsed.searchParams.set('utm_campaign', AFFILIATE_CONFIG.campaignName);
      parsed.searchParams.set('subid', `job_${job.id}`);
    } else if (host.includes('ziprecruiter.')) {
      parsed.searchParams.set('partner_id', AFFILIATE_CONFIG.sources.ziprecruiter.partnerId);
      parsed.searchParams.set('utm_source', AFFILIATE_CONFIG.sources.ziprecruiter.utmSource);
      parsed.searchParams.set('utm_medium', AFFILIATE_CONFIG.sources.ziprecruiter.utmMedium);
      parsed.searchParams.set('campaign', AFFILIATE_CONFIG.campaignName);
    } else if (host.includes('jooble.')) {
      parsed.searchParams.set('rgid', AFFILIATE_CONFIG.sources.jooble.affiliateId);
      parsed.searchParams.set('utm_source', AFFILIATE_CONFIG.sources.jooble.utmSource);
      parsed.searchParams.set('utm_medium', AFFILIATE_CONFIG.sources.jooble.utmMedium);
    } else if (host.includes('talent.')) {
      parsed.searchParams.set('source', AFFILIATE_CONFIG.sources.talent.partnerId);
      parsed.searchParams.set('utm_source', AFFILIATE_CONFIG.sources.talent.utmSource);
    } else if (host.includes('remotive.')) {
      parsed.searchParams.set('ref', AFFILIATE_CONFIG.sources.remotive.refId);
      parsed.searchParams.set('utm_source', AFFILIATE_CONFIG.sources.remotive.utmSource);
    } else if (host.includes('getonbrd.') || host.includes('getonboard.')) {
      parsed.searchParams.set('ref', AFFILIATE_CONFIG.sources.getonboard.refId);
      parsed.searchParams.set('utm_source', AFFILIATE_CONFIG.sources.getonboard.utmSource);
    } else {
      // Parámetros UTM estándar para cualquier otro portal externo
      if (!parsed.searchParams.has('utm_source')) {
        parsed.searchParams.set('utm_source', 'jobsbot');
      }
      if (!parsed.searchParams.has('utm_medium')) {
        parsed.searchParams.set('utm_medium', 'job_aggregator');
      }
      if (!parsed.searchParams.has('utm_campaign')) {
        parsed.searchParams.set('utm_campaign', 'candidate_referral');
      }
    }

    return parsed.toString();
  } catch {
    // Si la URL no es válida de origen, devolver original con fallback
    return job.applyUrl;
  }
}

export interface OutboundClickEvent {
  jobId: string;
  jobTitle: string;
  company: string;
  source: string;
  timestamp: string;
  cpcEstimateUsd: number;
}

/**
 * Registra el clic saliente para auditoría de tráfico y estimación de ingresos CPC
 */
export function recordOutboundClick(job: JobOffer): void {
  try {
    const now = new Date().toISOString();
    // Estimación conservadora promedio de CPC según portal
    const sourceLower = (job.source || '').toLowerCase();
    let cpcEstimate = 0.25;
    if (sourceLower.includes('indeed')) cpcEstimate = 0.45;
    else if (sourceLower.includes('ziprecruiter')) cpcEstimate = 0.55;
    else if (sourceLower.includes('jooble')) cpcEstimate = 0.30;
    else if (sourceLower.includes('talent')) cpcEstimate = 0.35;

    const event: OutboundClickEvent = {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      source: job.source,
      timestamp: now,
      cpcEstimateUsd: cpcEstimate,
    };

    const existingJson = localStorage.getItem(STORAGE_KEY_AFFILIATE_CLICKS);
    const list: OutboundClickEvent[] = existingJson ? JSON.parse(existingJson) : [];
    list.push(event);

    // Mantener los últimos 200 eventos en caché local
    if (list.length > 200) {
      list.splice(0, list.length - 200);
    }
    localStorage.setItem(STORAGE_KEY_AFFILIATE_CLICKS, JSON.stringify(list));
  } catch (err) {
    console.warn('[AffiliateEngine] No se pudo guardar evento de clic:', err);
  }
}

/**
 * Devuelve el resumen acumulado de clics salientes e ingresos estimados para el administrador
 */
export function getOutboundStats(): {
  totalClicks: number;
  estimatedRevenueUSD: number;
  clicksBySource: Record<string, number>;
} {
  try {
    const existingJson = localStorage.getItem(STORAGE_KEY_AFFILIATE_CLICKS);
    if (!existingJson) {
      return { totalClicks: 0, estimatedRevenueUSD: 0, clicksBySource: {} };
    }

    const list: OutboundClickEvent[] = JSON.parse(existingJson);
    const totalClicks = list.length;
    const estimatedRevenueUSD = list.reduce((sum, item) => sum + (item.cpcEstimateUsd || 0.25), 0);

    const clicksBySource: Record<string, number> = {};
    for (const item of list) {
      const src = item.source || 'Otros';
      clicksBySource[src] = (clicksBySource[src] || 0) + 1;
    }

    return {
      totalClicks,
      estimatedRevenueUSD: Number(estimatedRevenueUSD.toFixed(2)),
      clicksBySource,
    };
  } catch {
    return { totalClicks: 0, estimatedRevenueUSD: 0, clicksBySource: {} };
  }
}

