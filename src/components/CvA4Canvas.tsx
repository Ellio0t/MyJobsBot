import React from 'react';
import { CVProfile } from '../types';

interface CvA4CanvasProps {
  profile: CVProfile;
  onAvatarClick?: () => void;
}

export const CvA4Canvas: React.FC<CvA4CanvasProps> = ({ profile, onAvatarClick }) => {
  return (
    <div className="cv-a4-sheet bg-white text-[#222222] w-full max-w-[210mm] min-h-[297mm] mx-auto p-[14mm_16mm] shadow-2xl border border-neutral-200 transition-all">
      {/* HEADER EJECUTIVO */}
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

      {/* LAYOUT 2 COLUMNAS (ESTILO EJECUTIVO DEL USUARIO) */}
      <div className="flex gap-6 flex-1">
        {/* COLUMNA IZQUIERDA (31%) */}
        <div className="w-[31%] pr-4 border-r border-neutral-200 flex flex-col gap-4">
          {/* INFO */}
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

          {/* SKILLS CON BARRAS EJECUTIVAS */}
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
                  <div className="text-[8pt] font-semibold text-[#222222] mb-1 leading-tight">{skill.name}</div>
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

          {/* IDIOMAS */}
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

          {/* BLOQUE ATS KEYWORDS */}
          <section className="pt-1 border-t border-neutral-200">
            <h2
              className="font-montserrat text-[8pt] font-bold tracking-[1px] uppercase text-[#111111] mb-1"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              ATS INDEXING KEYWORDS
            </h2>
            <p className="text-[7pt] text-[#555555] leading-relaxed">
              {profile.atsKeywords.join(' • ')}
            </p>
          </section>
        </div>

        {/* COLUMNA DERECHA (69%) */}
        <div className="w-[69%] flex flex-col gap-4">
          {/* PROFILE SUMMARY */}
          <section>
            <h2
              className="font-montserrat text-[9.5pt] font-bold tracking-[1.2px] uppercase text-[#111111] mb-1"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              PROFILE
            </h2>
            <div className="w-[26px] h-[2.5px] bg-[#111111] mb-2" />
            <p className="text-[8.6pt] text-[#333333] text-justify leading-[1.45]">{profile.summary}</p>
          </section>

          {/* EXPERIENCIA OPERATIVA Y PROYECTOS */}
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
                    <span className="text-[7.8pt] font-semibold text-[#555555] shrink-0">{exp.location}</span>
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

          {/* EDUCACIÓN Y CERTIFICACIONES */}
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
                  <div className="font-montserrat text-[8.8pt] font-bold text-[#111111]">{edu.degree}</div>
                  <div className="text-[7.8pt] font-semibold text-[#555555]">{edu.year}</div>
                </div>
                <div className="text-[8pt] text-[#444444] font-semibold">{edu.institution}</div>
                <p className="text-[8pt] text-[#555555] mt-0.5">{edu.details}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};

/**
 * Abre el CV en una ventana limpia del navegador con los 2 botones flotantes configurados
 * que desaparecen al 100% cuando se presiona Imprimir / Guardar PDF.
 */
export function openStandaloneBrowserCv(profile: CVProfile) {
  const win = window.open('', '_blank');
  if (!win) return;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CV ${profile.fullName} - Vista Ejecutiva ATS</title>
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
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 16px;
      border-bottom: 1px solid #ddd;
    }
    .name {
      font-family: 'Montserrat', sans-serif;
      font-size: 23pt;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #111;
    }
    .headline {
      font-family: 'Montserrat', sans-serif;
      font-size: 9.5pt;
      font-weight: 600;
      color: #444;
      margin-top: 4px;
    }
    .photo-box {
      width: 25mm;
      height: 31mm;
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;
      margin-left: 18px;
    }
    .photo-box img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .cols { display: flex; gap: 22px; }
    .left { width: 31%; padding-right: 16px; border-right: 1px solid #e0e0e0; }
    .right { width: 69%; }
    .sec-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 9.5pt;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #111;
      margin-bottom: 4px;
    }
    .bar { width: 26px; height: 2.5px; background: #111; margin-bottom: 10px; }
    .info-item { margin-bottom: 9px; font-size: 8.2pt; }
    .info-label { font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 7.2pt; color: #111; text-transform: uppercase; }
    .skill-item { margin-bottom: 8px; }
    .skill-name { font-size: 8pt; font-weight: 600; margin-bottom: 3px; }
    .prog-bg { width: 100%; height: 4px; background: #e0e0e0; border-radius: 2px; }
    .prog-fill { height: 100%; background: #111; border-radius: 2px; }
    .exp-item { margin-bottom: 13px; }
    .exp-head { display: flex; justify-content: space-between; font-family: 'Montserrat', sans-serif; font-size: 9pt; font-weight: 700; color: #111; }
    .exp-sub { font-size: 7.7pt; color: #666; font-style: italic; margin-bottom: 4px; }
    ul { padding-left: 15px; }
    li { font-size: 8.2pt; line-height: 1.38; margin-bottom: 3px; color: #333; }
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
    <button onclick="const p=document.getElementById('cv-photo'); p.style.display = p.style.display==='none' ? 'block' : 'none';">
      👤 Mostrar/Ocultar Foto (Modo ATS)
    </button>
    <button class="primary" onclick="window.print()">
      🖨️ Imprimir / Guardar PDF
    </button>
  </div>
  <div class="page">
    <div class="header">
      <div>
        <div class="name">${profile.fullName}</div>
        <div class="headline">${profile.headline}</div>
      </div>
      <div class="photo-box" id="cv-photo" style="display: ${profile.showPhotoInCV ? 'block' : 'none'}">
        <img src="${window.location.origin}${profile.avatarUrl}" alt="${profile.fullName}" />
      </div>
    </div>
    <div class="cols">
      <div class="left">
        <div class="sec-title">INFO</div>
        <div class="bar"></div>
        <div class="info-item"><div class="info-label">DISPONIBILIDAD</div><div>${profile.availability}</div></div>
        <div class="info-item"><div class="info-label">TELÉFONO / WHATSAPP</div><div>${profile.phone}</div></div>
        <div class="info-item"><div class="info-label">EMAIL</div><div>${profile.email}</div></div>
        <div class="info-item"><div class="info-label">LINKEDIN</div><div>${profile.linkedin}</div></div>
        <br/>
        <div class="sec-title">SKILLS</div>
        <div class="bar"></div>
        ${profile.skills
          .map(
            (s) =>
              `<div class="skill-item"><div class="skill-name">${s.name}</div><div class="prog-bg"><div class="prog-fill" style="width:${s.level}%"></div></div></div>`
          )
          .join('')}
        <br/>
        <div class="sec-title">LANGUAGES</div>
        <div class="bar"></div>
        ${profile.languages
          .map((l) => `<div class="info-item"><strong>${l.name}</strong><div style="color:#555">${l.level}</div></div>`)
          .join('')}
      </div>
      <div class="right">
        <div class="sec-title">PROFILE</div>
        <div class="bar"></div>
        <p style="font-size:8.6pt; line-height:1.45; text-align:justify; margin-bottom:16px;">${profile.summary}</p>
        <div class="sec-title">EXPERIENCIA PROFESIONAL Y PROYECTOS</div>
        <div class="bar"></div>
        ${profile.experiences
          .map(
            (e) =>
              `<div class="exp-item"><div class="exp-head"><span>${e.role}</span><span style="font-size:7.8pt;color:#555">${e.location}</span></div><div class="exp-sub">${e.company} • ${e.period}</div><ul>${e.bullets
                .map((b) => `<li>${b}</li>`)
                .join('')}</ul></div>`
          )
          .join('')}
      </div>
    </div>
  </div>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}

