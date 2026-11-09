# Tech Radar & Inventario de Herramientas Fiscalizadas

Este inventario audita las herramientas y tecnologías utilizadas en todos los proyectos de tu portafolio, indicando su propósito, proyecto de origen, nivel de riesgo ante la IA y el valor diferencial humano.

---

## 📱 1. Ecosistema Mobile & Multiplataforma

### **Flutter & Dart**
- **Proyectos:** `Code (WinIt - 5 flavors)`, `FlowDash`, `Master`
- **Función:** Framework y lenguaje base para construir apps nativas (Android/iOS/Web) desde un único código.
- **¿Por qué la IA depende del humano aquí?:** La IA genera código de UI rápidamente, pero falla estrepitosamente en: ciclo de vida de actividades nativas de Android/iOS, fugas de memoria por Streams sin cerrar, optimización de árboles de widgets complejos para mantener 60/120 fps, y configuración de Gradle/NDK con versiones cruzadas.
- **Nivel Actual:** Nivel II (Supervisor) -> **Meta:** Nivel IV (Architect).

### **Arquitectura Multi-Flavor (Gradle + Android Manifest)**
- **Proyectos:** `Code` (WinIt, Perks, Swag, CodBlox, Crypto)
- **Función:** Compilar 5 identidades de marca comerciales independientes con diferentes package names, assets e iconos desde un solo proyecto.
- **¿Por qué la IA depende del humano aquí?:** La IA suele romper configuraciones de manifiesto, firmas de keystores y variantes de Gradle. Se requiere criterio humano para organizar carpetas de sabores (`flavors`), permisos y reglas de ProGuard específicas por aplicación.

### **CapacitorJS (Hybrid Native Bridge para Android & iOS)**
- **Proyectos:** `JobsBOT` (Plataforma SaaS de Empleos & Optimizador de CV ATS)
- **Función:** Empaquetar aplicaciones web modernas (React 19 + TypeScript + Vite) en binarios nativos reales (`.aab`/`.apk` para Google Play Store y `.ipa` para Apple App Store) exponiendo APIs nativas del dispositivo (cámara para avatar, sistema de archivos, autenticación OAuth nativa y notificaciones Push).
- **¿Por qué la IA depende del humano aquí?:** Para pasar la revisión de Google Play y especialmente la **Guideline 4.2 de Apple App Store (Minimum Functionality)**, una app no puede ser un simple sitio web metido en un marco. Requiere criterio de arquitectura humano para integrar capacidades nativas reales, manejar permisos de privacidad (`Info.plist` y `AndroidManifest.xml`), configurar *Deep Links* y cumplir las políticas de eliminación de cuenta obligatorias.

---

## ☁️ 2. Cloud Serverless, Bases de Datos & Backend

### **Google Firebase Suite (Firestore, Auth, Functions, Hosting, FCM)**
- **Proyectos:** `Code`, `Master`, `Monitor`, `NotiHub`
- **Función:** Base de datos NoSQL reactiva en tiempo real, autenticación, notificaciones push nativas y funciones backend serverless.
- **¿Por qué la IA depende del humano aquí?:** Las IAs suelen escribir reglas de seguridad demasiado permisivas (`allow read, write: if true;`) que provocan hackeos de datos o facturas sorpresa de miles de dólares por lecturas recursivas innecesarias. El diseño de índices compuestos, cuotas y caching offline requiere diseño arquitectónico humano.

### **Server-to-Server (S2S) Webhooks & Anti-Fraude**
- **Proyectos:** `Code`, `NotiHub`
- **Función:** Confirmación criptográfica y validación de recompensas entre servidores de terceros (redes CPA, Bitrefill) y tu base de datos sin intervención del cliente.
- **¿Por qué la IA depende del humano aquí?:** La IA no sabe prever ataques de repetición (*replay attacks*), suplantación de IPs mediante proxies residenciales o manipulación de estados intermedios. Requiere lógica de validación humana rigurosa.

---

## 💰 3. Ad-Tech, Arbitraje & Monetización Programática

### **Google AdMob (Rewarded, Interstitial, Native, Mediación)**
- **Proyectos:** `Code (WinIt)`
- **Función:** Motor de generación de ingresos mediante subastas de anuncios y videos con recompensas.
- **¿Por qué la IA depende del humano aquí?:** Google banea permanentemente las cuentas de desarrolladores que cometan errores sutiles de políticas (tráfico inválido, clics accidentales, retrasos de renderizado). La IA no asume la responsabilidad legal ni de cumplimiento de normativas de Google Play / AdMob. Saber cómo y cuándo disparar un anuncio sin infringir políticas es un conocimiento humano de altísimo valor económico.

### **Offerwalls & CPA Integrations (CPX Research, CPALead)**
- **Proyectos:** `Code (WinIt)`
- **Función:** Integración de encuestas y muros de ofertas remuneradas para elevar el ARPU (ingreso promedio por usuario).
- **¿Por qué la IA depende del humano aquí?:** Exige conciliar discrepancias de pagos, gestionar devoluciones por chargebacks y asegurar que el usuario no reciba puntos fraudulentos.

---

## ⚡ 4. Automatización Multi-Motor, Web Scraping & Human-in-the-Loop

### **Orquestación Multi-Motor: n8n, Make.com, Zapier, Activepieces & Pipedream**
- **Proyectos:** `FlowDash` (`automation_api_service.dart`), `NotiHub`
- **Función:** Integración unificada mediante APIs nativas (`/api/v1/workflows` en n8n, `/api/v2/scenarios` en Make, `/api/v1/flows` en Activepieces, tokens Bearer en Zapier/Pipedream) para monitorear, disparar y supervisar flujos de trabajo desde una sola consola móvil con autenticación biométrica y QR.
- **¿Por qué la IA depende del humano aquí?:** Cada motor de automatización maneja cabeceras de seguridad distintas (`X-N8N-API-KEY` vs `Authorization: Token` vs `Bearer`), límites de tasa (*rate limits*) y estructuras de error heterogéneas. Diseñar un puente universal con intervención humana (*Human-in-the-Loop*) es arquitectura pura de alto nivel.


### **Apify (Web Scrapers & Crawlers)**
- **Proyectos:** `NotiHub`, extractores de ofertas
- **Función:** Extracción automatizada de datos desde sitios web complejos con proxies rotativos y emulación de navegadores.
- **¿Por qué la IA depende del humano aquí?:** Los sitios web cambian constantemente su DOM, añaden sistemas anti-bot (Cloudflare, reCAPTCHA) y modifican selectores. Requiere un humano que inspeccione y reajuste los extractores cuando se rompen.

---

## 🌐 5. Frontend Moderno & PWAs

### **React 19 + TypeScript + Vite + Tailwind CSS**
- **Proyectos:** `Monitor`, `NotiHub`, `MYJOBSBOT`
- **Función:** Interfaces web de alta velocidad, tipadas y responsivas para consumo de datos financieros, operativos y emparejamiento laboral ATS en tiempo real.
- **¿Por qué la IA depende del humano aquí?:** Estructura del ciclo de vida de renderizado, optimización de bundle size y experiencia de usuario (UX) intuitiva con accesibilidad y diseño táctil.

### **Dual Iconography Engine: Remix Icon + Font Awesome 6 (CDN/Webfonts)**
- **Proyectos:** `MYJOBSBOT`
- **Función:** Sistema combinado de iconografía vectorial de precisión (`ri-robot-3-line` como isotipo oficial de marca en Remix Icon junto con iconos de marcas oficiales `fa-brands` de Font Awesome para WhatsApp, Telegram, Google y LinkedIn).
- **¿Por qué la IA depende del humano aquí?:** Seleccionar el peso visual consistente (línea vs relleno) entre dos librerías distintas sin saturar la interfaz y garantizando que las hojas de estilo se excluyan o rendericen limpiamente durante la exportación `@media print`.

### **Google Gemini API (`@google/genai`)**
- **Proyectos:** `Monitor`, `NotiHub`
- **Función:** Inyección de inteligencia artificial para análisis contextual, clasificación y resúmenes automáticos.
- **¿Por qué la IA depende del humano aquí?:** La IA comete alucinaciones y requiere *Prompt Engineering* robusto, validación de esquemas JSON estructurados y control estricto de costes de tokens.

### **RapidAPI JSearch Engine (LinkedIn, Indeed & Google Jobs Aggregator)**
- **Proyectos:** `MYJOBSBOT` (`src/services/jobEngine.ts`)
- **Función:** Indexación en vivo de ofertas laborales masivas agregando fuentes de LinkedIn, Indeed, Glassdoor y Google Jobs mediante el endpoint `/search-v2` de RapidAPI con deduplicación cruzada y extracción de salarios.
- **¿Por qué la IA depende del humano aquí?:** Las APIs de terceros cambian de versión (`/search` a `/search-v2`), mutan esquemas JSON y tienen cuotas estrictas de rate-limiting. Se requiere criterio de arquitectura para implementar fallbacks de fuentes públicas (Get on Board, Remotive) y caché para no agotar presupuestos de API.

### **Client-Side CV Stream Parser & ATS Match Engine**
- **Proyectos:** `MYJOBSBOT` (`src/services/cvParser.ts`, `src/services/jobEngine.ts`)
- **Función:** Extracción de texto y entidades clave en tiempo de ejecución del navegador a partir de documentos subidos por el usuario (PDFs, TXT, HTML, MD) para poblar automáticamente el CV Virtual editable y calcular afinidad algorítmica ATS frente a cada vacante.
- **¿Por qué la IA depende del humano aquí?:** Los documentos subidos por los usuarios no tienen una estructura predecible: vienen con formatos de dos columnas, texto incrustado binario en PDFs, o fuentes no estándar. Diseñar heurísticas de extracción de contacto, normalización de habilidades técnicas y formateo A4 limpio sin llamadas costosas a un backend es una decisión de alta eficiencia e ingeniería humana.



