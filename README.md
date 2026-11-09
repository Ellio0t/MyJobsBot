# 🤖 MyJobsBOT — Copiloto Inteligente de Empleo & Radar ATS

[![Firebase Hosting](https://img.shields.io/badge/Hosting-Live%20on%20Firebase-0284c7?style=flat-square&logo=firebase)](https://myjobsbot.web.app)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Capacitor](https://img.shields.io/badge/Mobile-CapacitorJS%207-1199ee?style=flat-square&logo=capacitor)](https://capacitorjs.com)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

> **Tu Agente Personal de Búsqueda de Empleo y Mutación de CV ATS.**  
> Indexa ofertas laborales en vivo desde APIs abiertas, calcula afinidad con filtros ATS, genera propuestas personalizadas y adapta currículums profesionales en tiempo real.

🌐 **Producción en vivo:** [https://myjobsbot.web.app](https://myjobsbot.web.app)

---

## ⚡ Características Principales

* **📡 Radar de Empleos Multifuente**:
  * Sincronización en vivo con APIs públicas internacionales (*Remotive, Get on Board, RemoteOK*).
  * Filtro por áreas: *Tecnología, QA & Testing, Soporte, Data & Contenido, Operaciones*.
  * Selector por idioma (*Español, Inglés Técnico, Inglés Conversacional*) y búsqueda por texto libre.

* **🎯 Evaluador de Compatibilidad ATS (Applicant Tracking Systems)**:
  * Motor algorítmico que compara las palabras clave del CV contra las exigencias del puesto.
  * Porcentaje de afinidad (*Match Score*) instantáneo por vacante.

* **📑 Ventana Emergente de Propuesta Laboral**:
  * Visualización completa de responsabilidades, salario, modalidad y requerimientos.
  * Aislamiento estricto de desplazamiento (*scroll bleed protection*).

* **✉️ Redactor Ejecutivo de Propuestas & Correo ATS**:
  * Redacción automática de correos y cartas de presentación personalizadas para cada reclutador.
  * Exportación directa a **Gmail**, cliente de correo nativo, **WhatsApp Directo** y **Telegram**.

* **📄 Generador y Editor de CV ATS (My CV)**:
  * Formato A4 imprimible con estandarización para lectores de currículums robotizados.
  * Sin riesgo de filtración: la plantilla de visitante está completamente anonimizada.

* **🎨 Diseño Ejecutivo Dark Carbone**:
  * Paleta de alto contraste `#070709` profundo, `#12151c` para paneles y acentos en verde claro `#4ade80`.
  * Modo Claro / Oscuro / Automático con persistencia en `localStorage`.

* **📱 Multiplataforma (Web & Mobile Ready)**:
  * Empaquetado y sincronizado con **CapacitorJS** para compilación nativa en **Android** e **iOS**.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework Web** | React 19 + TypeScript |
| **Empaquetador** | Vite 6 |
| **Estilos & UI** | Tailwind CSS v4, Lucide React, Remix Icon, Font Awesome 6 |
| **Móvil (Híbrido)** | CapacitorJS 7 (Android & iOS) |
| **Cloud & Hosting** | Google Firebase Hosting |
| **APIs de Empleo** | Remotive API, Get on Board API |

---

## 🔒 Privacidad y Protección de Datos Sensibles

Este repositorio cuenta con directivas estrictas de seguridad:
* **Sin filtración de CVs privados**: Los documentos curriculares reales, certificados o fotos personales residen en directorios locales excluidos por `.gitignore` (`curriculum/`, `*.pdf`, `*.docx`).
* **Variables de Entorno**: Compatible con prefijos `VITE_FIREBASE_*` mediante [`.env.example`](./.env.example).
* **Cachés de compilación excluidos**: Archivos temporales de Firebase (`.firebase/`) y TypeScript (`*.tsbuildinfo`) están fuera del historial de Git.

---

## 🚀 Inicio Rápido (Desarrollo Local)

### 1. Clonar el repositorio
```bash
git clone https://github.com/Ellio0t/MyJobsBot.git
cd MyJobsBot
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno (opcional)
```bash
cp .env.example .env.local
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

---

## 📦 Compilación y Despliegue

### Compilar para Producción
```bash
npm run build
```

### Sincronizar Plataformas Móviles (Capacitor)
```bash
npm run cap:sync
```

### Abrir Proyecto Android / iOS
```bash
npm run cap:android  # Requiere Android Studio
npm run cap:ios      # Requiere Xcode (macOS)
```

### Desplegar a Firebase Hosting
```bash
npx firebase-tools deploy --only hosting --project myjobsbot
```

---

## 📜 Licencia

Distribuido bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más información.
