import React from 'react';
import { CVProfile } from '../types';

export type CvTemplateId = 'harvard' | 'executive';

interface CvA4CanvasProps {
  profile: CVProfile;
  onAvatarClick?: () => void;
  template?: CvTemplateId;
  scale?: number;
}

export const CvA4Canvas: React.FC<CvA4CanvasProps> = ({
  profile,
  onAvatarClick,
  template = 'harvard',
  scale = 1
}) => {
  // Dimensiones base de la hoja A4 estándar internacional: 210mm x 297mm (~794px x 1123px a 96 DPI)
  const BASE_WIDTH_MM = 210;
  const BASE_HEIGHT_MM = 297;

  return (
    <div
      className="cv-a4-scaler-viewport transition-all mx-auto flex justify-center items-start print:m-0 print:p-0 print:transform-none"
      style={{
        width: scale === 1 ? `${BASE_WIDTH_MM}mm` : `${BASE_WIDTH_MM * scale}mm`,
        height: scale === 1 ? 'auto' : `${BASE_HEIGHT_MM * scale}mm`,
      }}
    >
      <div
        id="cv-sheet-to-print"
        className="cv-a4-sheet bg-white text-[#222222] shadow-2xl border border-neutral-300 print:border-none print:shadow-none print:transform-none origin-top transition-transform"
        style={{
          width: `${BASE_WIDTH_MM}mm`,
          minHeight: `${BASE_HEIGHT_MM}mm`,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          padding: '14mm 16mm',
          fontFamily: "'Open Sans', sans-serif",
        }}
      >
        {/* ===================================================================
            PLANTILLA 1: HARVARD STANDARD ATS (COLUMNA ÚNICA - 100% TRACCIÓN)
            =================================================================== */}
        {template === 'harvard' ? (
          <div className="cv-harvard-layout flex flex-col gap-3.5 text-[#1a1a1a]">
            {/* CABECERA CENTRADA HARVARD */}
            <header className="text-center pb-2.5 border-b-2 border-neutral-900">
              <h1
                className="text-[20pt] font-extrabold uppercase tracking-[1.2px] text-[#111111] leading-tight mb-1"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {profile.fullName}
              </h1>
              <div
                className="text-[10pt] font-bold text-[#333333] tracking-[0.5px] mb-1.5"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {profile.headline}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[8.5pt] text-[#444444] font-medium">
                <span>{profile.email}</span>
                <span>•</span>
                <span>{profile.phone}</span>
                <span>•</span>
                <span>{profile.location}</span>
                {profile.linkedin && (
                  <>
                    <span>•</span>
                    <span className="text-[#111111] font-semibold">{profile.linkedin}</span>
                  </>
                )}
                <span>•</span>
                <span className="font-semibold text-emerald-800">{profile.availability}</span>
              </div>
            </header>

            {/* RESUMEN PROFESIONAL */}
            {profile.summary && (
              <section>
                <h2
                  className="text-[9pt] font-extrabold tracking-[1px] uppercase text-[#111111] pb-0.5 border-b border-neutral-400 mb-1.5"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Resumen Ejecutivo
                </h2>
                <p className="text-[8.5pt] text-[#2c2c2c] text-justify leading-[1.45]">
                  {profile.summary}
                </p>
              </section>
            )}

            {/* EXPERIENCIA LABORAL Y LOGROS (FÓRMULA DE GOOGLE: LOGRÉ X MEDIDO POR Y) */}
            <section>
              <h2
                className="text-[9pt] font-extrabold tracking-[1px] uppercase text-[#111111] pb-0.5 border-b border-neutral-400 mb-2"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Experiencia Profesional & Proyectos
              </h2>
              <div className="space-y-3">
                {profile.experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-montserrat text-[9pt] font-bold text-[#111111]">
                        {exp.company}
                      </span>
                      <span className="text-[8pt] font-semibold text-[#555555]">
                        {exp.location}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[8.5pt] font-semibold text-[#333333] italic">
                        {exp.role}
                      </span>
                      <span className="text-[7.8pt] font-medium text-[#666666]">
                        {exp.period}
                      </span>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.8 text-[8.2pt] text-[#2c2c2c] leading-[1.38]">
                      {exp.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* HABILIDADES TÉCNICAS (TEXTO PLANO SIN BARRAS, ÓPTIMO PARA ATS) */}
            <section>
              <h2
                className="text-[9pt] font-extrabold tracking-[1px] uppercase text-[#111111] pb-0.5 border-b border-neutral-400 mb-1.5"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Competencias Técnicas & Herramientas
              </h2>
              <div className="space-y-1 text-[8.2pt]">
                <div>
                  <strong className="text-[#111111]">Habilidades Clave: </strong>
                  <span className="text-[#333333]">
                    {profile.skills.map((s) => s.name).join(', ')}
                  </span>
                </div>
                <div>
                  <strong className="text-[#111111]">Idiomas: </strong>
                  <span className="text-[#333333]">
                    {profile.languages.map((l) => `${l.name} (${l.level})`).join(' • ')}
                  </span>
                </div>
                {profile.atsKeywords && profile.atsKeywords.length > 0 && (
                  <div>
                    <strong className="text-[#111111]">Indexación ATS: </strong>
                    <span className="text-[#555555] text-[7.8pt]">
                      {profile.atsKeywords.join(' • ')}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* EDUCACIÓN & CERTIFICACIONES */}
            <section>
              <h2
                className="text-[9pt] font-extrabold tracking-[1px] uppercase text-[#111111] pb-0.5 border-b border-neutral-400 mb-1.5"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Formación Académica
              </h2>
              <div className="space-y-2">
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-baseline">
                    <div>
                      <span className="font-bold text-[8.5pt] text-[#111111]">{edu.degree}</span>
                      <span className="text-[8pt] text-[#444444]"> — {edu.institution}</span>
                      {edu.details && (
                        <span className="text-[7.8pt] text-[#666666]"> ({edu.details})</span>
                      )}
                    </div>
                    <span className="text-[8pt] font-medium text-[#666666] shrink-0">{edu.year}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* ===================================================================
              PLANTILLA 2: MODERN EXECUTIVE (2 COLUMNAS - CONTACTO DIRECTO)
              =================================================================== */
          <div className="cv-executive-layout">
            <header className="flex items-center justify-between pb-3.5 mb-4 border-b border-neutral-300">
              <div className="flex-1 pr-4">
                <h1
                  className="font-montserrat text-[23pt] font-extrabold tracking-[1.5px] uppercase text-[#111111] leading-tight mb-1"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {profile.fullName}
                </h1>
                <div
                  className="font-montserrat text-[9.5pt] font-semibold text-[#444444] tracking-[0.3px] leading-snug"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {profile.headline}
                </div>
              </div>

              {profile.showPhotoInCV && (
                <div
                  onClick={onAvatarClick}
                  title="Haz clic para cambiar tu foto de perfil / avatar"
                  className="w-[25mm] h-[31mm] border border-neutral-300 rounded-[4px] overflow-hidden shrink-0 cursor-pointer relative group bg-neutral-100"
                >
                  <img
                    src={profile.avatarUrl || '/elliot_barrios.jpg'}
                    alt={profile.fullName}
                    className="w-full h-full object-cover block"
                  />
                  <div className="no-print absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[7pt] text-white font-semibold text-center px-1">
                    Cambiar Avatar
                  </div>
                </div>
              )}
            </header>

            <div className="flex gap-6 flex-1">
              {/* COLUMNA IZQUIERDA (31%) */}
              <div className="w-[31%] pr-4 border-r border-neutral-200 flex flex-col gap-4">
                <section>
                  <h2
                    className="font-montserrat text-[9.5pt] font-bold tracking-[1.2px] uppercase text-[#111111] mb-1"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    INFO
                  </h2>
                  <div className="w-[26px] h-[2.5px] bg-[#111111] mb-2.5" />

                  <div className="space-y-2.5 text-[8.2pt]">
                    <div>
                      <div className="font-montserrat font-bold text-[7.3pt] uppercase tracking-[0.7px] text-[#111111]">
                        DISPONIBILIDAD
                      </div>
                      <div className="text-[#4a4a4a]">{profile.availability}</div>
                    </div>
                    <div>
                      <div className="font-montserrat font-bold text-[7.3pt] uppercase tracking-[0.7px] text-[#111111]">
                        TELÉFONO / WHATSAPP
                      </div>
                      <div className="text-[#4a4a4a]">{profile.phone}</div>
                    </div>
                    <div>
                      <div className="font-montserrat font-bold text-[7.3pt] uppercase tracking-[0.7px] text-[#111111]">
                        EMAIL
                      </div>
                      <div className="text-[#4a4a4a] break-all">{profile.email}</div>
                    </div>
                    <div>
                      <div className="font-montserrat font-bold text-[7.3pt] uppercase tracking-[0.7px] text-[#111111]">
                        LINKEDIN
                      </div>
                      <div className="text-[#4a4a4a] break-all">{profile.linkedin}</div>
                    </div>
                    <div>
                      <div className="font-montserrat font-bold text-[7.3pt] uppercase tracking-[0.7px] text-[#111111]">
                        MODALIDAD / UBICACIÓN
                      </div>
                      <div className="text-[#4a4a4a]">{profile.location}</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2
                    className="font-montserrat text-[9.5pt] font-bold tracking-[1.2px] uppercase text-[#111111] mb-1"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    SKILLS
                  </h2>
                  <div className="w-[26px] h-[2.5px] bg-[#111111] mb-2.5" />

                  <div className="space-y-2">
                    {profile.skills.map((skill, idx) => (
                      <div key={idx}>
                        <div className="text-[8pt] font-semibold text-[#222222] mb-1 leading-tight">
                          {skill.name}
                        </div>
                        <div className="w-full h-[4px] bg-[#e0e0e0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#111111] rounded-full"
                            style={{ width: `${Math.min(100, Math.max(40, skill.level))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2
                    className="font-montserrat text-[9.5pt] font-bold tracking-[1.2px] uppercase text-[#111111] mb-1"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    LANGUAGES
                  </h2>
                  <div className="w-[26px] h-[2.5px] bg-[#111111] mb-2.5" />

                  <div className="space-y-2 text-[8.2pt]">
                    {profile.languages.map((lang, idx) => (
                      <div key={idx}>
                        <div className="font-bold text-[#111111]">{lang.name}</div>
                        <div className="text-[#555555] text-[7.8pt]">{lang.level}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* COLUMNA DERECHA (69%) */}
              <div className="w-[69%] flex flex-col gap-4">
                <section>
                  <h2
                    className="font-montserrat text-[9.5pt] font-bold tracking-[1.2px] uppercase text-[#111111] mb-1"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    PROFILE
                  </h2>
                  <div className="w-[26px] h-[2.5px] bg-[#111111] mb-2" />
                  <p className="text-[8.6pt] text-[#333333] text-justify leading-[1.45]">
                    {profile.summary}
                  </p>
                </section>

                <section>
                  <h2
                    className="font-montserrat text-[9.5pt] font-bold tracking-[1.2px] uppercase text-[#111111] mb-1"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    EXPERIENCIA PROFESIONAL Y PROYECTOS VERIFICADOS
                  </h2>
                  <div className="w-[26px] h-[2.5px] bg-[#111111] mb-2.5" />

                  <div className="space-y-3.5">
                    {profile.experiences.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline gap-2">
                          <h3
                            className="font-montserrat text-[9pt] font-bold text-[#111111]"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {exp.role}
                          </h3>
                          <span className="text-[7.8pt] font-semibold text-[#555555] shrink-0">
                            {exp.location}
                          </span>
                        </div>
                        <div className="text-[7.7pt] italic text-[#666666] mb-1">
                          {exp.company} • {exp.period}
                        </div>
                        <ul className="list-disc pl-4 space-y-1">
                          {exp.bullets.map((b, i) => (
                            <li key={i} className="text-[8.2pt] text-[#333333] leading-[1.38]">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2
                    className="font-montserrat text-[9.5pt] font-bold tracking-[1.2px] uppercase text-[#111111] mb-1"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    FORMACIÓN Y ESPECIALIZACIÓN TÉCNICA
                  </h2>
                  <div className="w-[26px] h-[2.5px] bg-[#111111] mb-2" />
                  {profile.education.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between items-baseline">
                        <div className="font-montserrat text-[8.8pt] font-bold text-[#111111]">
                          {edu.degree}
                        </div>
                        <div className="text-[7.8pt] font-semibold text-[#555555]">
                          {edu.year}
                        </div>
                      </div>
                      <div className="text-[8pt] text-[#444444] font-semibold">{edu.institution}</div>
                      <p className="text-[8pt] text-[#555555] mt-0.5">{edu.details}</p>
                    </div>
                  ))}
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Abre el CV en una ventana limpia del navegador
 */
export function openStandaloneBrowserCv(profile: CVProfile, template: CvTemplateId = 'harvard') {
  const win = window.open('', '_blank');
  if (!win) return;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CV ${profile.fullName} - Vista Imprimible</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Open Sans', sans-serif;
      background: #e5e9f0;
      color: #222;
      display: flex;
      justify-content: center;
      padding: 25px 0;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      background: #fff;
      padding: 14mm 16mm;
      box-shadow: 0 8px 25px rgba(0,0,0,0.12);
    }
    .floating-toolbar {
      position: fixed;
      top: 16px;
      right: 20px;
      background: #111111;
      padding: 10px 16px;
      border-radius: 8px;
      display: flex;
      gap: 10px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      z-index: 9999;
    }
    .floating-toolbar button {
      font-family: 'Montserrat', sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      padding: 7px 13px;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid #444;
      background: #262626;
      color: #fff;
    }
    .floating-toolbar button.primary {
      background: #ffffff;
      color: #111111;
      border-color: #ffffff;
    }
    @media print {
      @page { size: A4 portrait; margin: 8mm 10mm; }
      body { background: #fff !important; padding: 0 !important; }
      .floating-toolbar { display: none !important; }
      .page { width: 100% !important; box-shadow: none !important; padding: 6mm 8mm !important; }
    }
  </style>
</head>
<body>
  <div class="floating-toolbar">
    <button class="primary" onclick="window.print()">
      🖨️ Imprimir / Guardar PDF (100% A4 Exacto)
    </button>
  </div>
  <div class="page">
    <div style="text-align: center; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 12px;">
      <h1 style="font-family:'Montserrat',sans-serif; font-size:20pt; font-weight:800; text-transform:uppercase;">${profile.fullName}</h1>
      <div style="font-family:'Montserrat',sans-serif; font-size:10pt; font-weight:700; color:#444; margin-top:2px;">${profile.headline}</div>
      <div style="font-size:8.5pt; color:#555; margin-top:4px;">
        ${profile.email} • ${profile.phone} • ${profile.location} • ${profile.availability}
      </div>
    </div>
    <div style="font-size:8.5pt; line-height:1.45; text-align:justify; margin-bottom:14px;">
      <h2 style="font-family:'Montserrat',sans-serif; font-size:9pt; font-weight:700; text-transform:uppercase; border-bottom:1px solid #999; padding-bottom:2px; margin-bottom:6px;">Resumen Profesional</h2>
      <p>${profile.summary}</p>
    </div>
    <div style="margin-bottom:14px;">
      <h2 style="font-family:'Montserrat',sans-serif; font-size:9pt; font-weight:700; text-transform:uppercase; border-bottom:1px solid #999; padding-bottom:2px; margin-bottom:8px;">Experiencia Laboral</h2>
      ${profile.experiences.map(e => `
        <div style="margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; font-weight:700; font-size:9pt;">
            <span>${e.company}</span><span>${e.location}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-style:italic; font-size:8.5pt; color:#444;">
            <span>${e.role}</span><span>${e.period}</span>
          </div>
          <ul style="padding-left:16px; font-size:8.2pt; line-height:1.35; margin-top:3px;">
            ${e.bullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
    <div>
      <h2 style="font-family:'Montserrat',sans-serif; font-size:9pt; font-weight:700; text-transform:uppercase; border-bottom:1px solid #999; padding-bottom:2px; margin-bottom:6px;">Competencias & Educación</h2>
      <div style="font-size:8.2pt; line-height:1.4;">
        <strong>Habilidades: </strong>${profile.skills.map(s => s.name).join(', ')}<br/>
        <strong>Idiomas: </strong>${profile.languages.map(l => `${l.name} (${l.level})`).join(' • ')}
      </div>
    </div>
  </div>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}
