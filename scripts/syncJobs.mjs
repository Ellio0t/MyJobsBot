/**
 * Script de Sincronización Programada de Empleos:
 * Extrae ofertas de Google Jobs (JSearch RapidAPI), Remotive y Get on Board,
 * las normaliza y las consolida en un snapshot para alimentar la base de datos sin riesgo de baneo.
 * 
 * Uso: node scripts/syncJobs.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAPIDAPI_KEY = process.env.VITE_RAPIDAPI_KEY || 'b6c42d6d33mshebc7c91f7f488b7p1cd1abjsn48c07df650cd';

async function fetchJSearchJobs() {
  console.log('🔍 Consultando JSearch API (Google Jobs / LinkedIn / Indeed)...');
  const jobs = [];
  try {
    const url = 'https://jsearch.p.rapidapi.com/search-v2?query=remote+qa+or+developer&num_pages=1';
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
      },
    });

    if (res.ok) {
      const json = await res.json();
      const raw = Array.isArray(json.data?.jobs) ? json.data.jobs : (Array.isArray(json.data) ? json.data : []);
      for (const item of raw) {
        const cleanDesc = (item.job_description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const lower = `${item.job_title} ${cleanDesc}`.toLowerCase();

        let cat = 'tech';
        if (lower.includes('qa') || lower.includes('test') || lower.includes('quality')) cat = 'qa';
        else if (lower.includes('data') || lower.includes('datos') || lower.includes('excel')) cat = 'data';
        else if (lower.includes('support') || lower.includes('soporte') || lower.includes('customer')) cat = 'support';
        else if (lower.includes('operations') || lower.includes('admin') || lower.includes('logistica')) cat = 'ops';

        let salary = item.job_salary_string || 'A convenir (USD)';
        if (item.job_min_salary && item.job_max_salary) {
          salary = `$${item.job_min_salary.toLocaleString()} - $${item.job_max_salary.toLocaleString()} ${item.job_salary_currency || 'USD'}`;
        }

        const applyLink = item.job_apply_link || '';
        const pub = (item.job_publisher || '').toLowerCase();
        let src = 'Google Jobs API';
        if (pub.includes('linkedin') || applyLink.includes('linkedin.com')) src = 'LinkedIn';
        else if (pub.includes('indeed') || applyLink.includes('indeed.com')) src = 'Indeed';

        const emailMatch = cleanDesc.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

        jobs.push({
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
          requirements: item.job_highlights?.Qualifications || item.job_required_skills || ['Verificado vía Google Jobs / ' + src],
          keywords: (item.job_required_skills || item.job_title.split(/\s+/)).slice(0, 7),
          source: src,
          applyUrl: applyLink || `https://www.google.com/search?q=${encodeURIComponent(item.job_title + ' ' + item.employer_name + ' jobs')}`,
          contactEmail: emailMatch ? emailMatch[0] : undefined,
          publishedAt: 'Sincronizado Hoy (' + src + ')',
        });
      }
      console.log(`✅ JSearch extrajo ${jobs.length} ofertas reales.`);
    } else {
      console.warn('⚠️ JSearch respondió con estado:', res.status);
    }
  } catch (err) {
    console.error('❌ Error en JSearch:', err.message);
  }
  return jobs;
}

async function fetchRemotiveJobs() {
  console.log('🔍 Consultando Remotive API...');
  const jobs = [];
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?search=qa&limit=15');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.jobs)) {
        for (const r of json.jobs) {
          const cleanDesc = (r.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          jobs.push({
            id: `remotive-${r.id}`,
            title: r.title,
            company: r.company_name || 'Empresa Remotive',
            companyLogo: r.company_logo || undefined,
            category: 'qa',
            salary: r.salary || '$1,500 - $3,000 USD',
            modality: '100% Remoto (Worldwide)',
            countryScope: r.candidate_required_location || 'Global / Worldwide',
            languageReq: 'Inglés Escrito / Técnico',
            oneLineSummary: cleanDesc.length > 20 ? cleanDesc.slice(0, 320) + '...' : `Posición en ${r.company_name}.`,
            description: cleanDesc,
            requirements: ['Validado vía Remotive Public API'],
            keywords: (r.tags || []).slice(0, 6),
            source: 'Remotive',
            applyUrl: r.url,
            publishedAt: 'Sincronizado Hoy (Remotive)',
          });
        }
      }
      console.log(`✅ Remotive extrajo ${jobs.length} ofertas reales.`);
    }
  } catch (err) {
    console.error('❌ Error en Remotive:', err.message);
  }
  return jobs;
}

async function fetchGetOnBoardJobs() {
  console.log('🔍 Consultando Get on Board API...');
  const jobs = [];
  try {
    const res = await fetch('https://www.getonbrd.com/api/v0/search/jobs?query=qa&per_page=15');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        for (const item of json.data) {
          const attr = item.attributes;
          if (!attr) continue;
          const cleanDesc = (attr.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const cleanFunc = (attr.functions || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const companyName = attr.company?.data?.attributes?.name || 'Empresa Get on Board';

          jobs.push({
            id: `gob-${item.id}`,
            title: attr.title,
            company: companyName,
            companyLogo: attr.company?.data?.attributes?.logo_url || undefined,
            category: 'qa',
            salary: attr.min_salary && attr.max_salary ? `$${attr.min_salary} - $${attr.max_salary} USD / mes` : 'A convenir (USD)',
            modality: attr.remote_modality === 'fully_remote' ? '100% Remoto (Global)' : 'Remoto Regional',
            countryScope: attr.remote_zone || 'LATAM',
            languageReq: 'Español 100%',
            oneLineSummary: cleanFunc.length > 20 ? cleanFunc.slice(0, 320) + '...' : cleanDesc.slice(0, 320) + '...',
            description: cleanDesc,
            requirements: ['Validado vía Get on Board Public API'],
            keywords: attr.title.split(/[\s,/()-]+/).filter((w) => w.length > 2).slice(0, 7),
            source: 'Get on Board',
            applyUrl: attr.links?.public_url || `https://www.getonbrd.com/jobs/${item.id}`,
            publishedAt: 'Sincronizado Hoy (Get on Board)',
          });
        }
      }
      console.log(`✅ Get on Board extrajo ${jobs.length} ofertas.`);
    }
  } catch (err) {
    console.error('❌ Error en Get on Board:', err.message);
  }
  return jobs;
}

async function main() {
  console.log('🚀 Iniciando proceso de rastreo seguro programado...');
  const [jSearchJobs, remotiveJobs, gobJobs] = await Promise.all([
    fetchJSearchJobs(),
    fetchRemotiveJobs(),
    fetchGetOnBoardJobs(),
  ]);

  const all = [...jSearchJobs, ...remotiveJobs, ...gobJobs];
  const seen = new Set();
  const deduplicated = [];

  for (const job of all) {
    const key = `${job.company.toLowerCase().trim()}_${job.title.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(job);
    }
  }

  const outPath = path.resolve(__dirname, '../src/data/liveJobsSnapshot.json');
  fs.writeFileSync(outPath, JSON.stringify(deduplicated, null, 2), 'utf-8');

  console.log(`\n🎉 Sincronización exitosa: ${deduplicated.length} vacantes consolidadas en:`);
  console.log(`📁 ${outPath}`);
  console.log(`Fuentes incluidas:`);
  const sources = {};
  deduplicated.forEach((j) => (sources[j.source] = (sources[j.source] || 0) + 1));
  console.table(sources);
}

main().catch(console.error);
