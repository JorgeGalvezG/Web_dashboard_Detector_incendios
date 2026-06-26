# IgnisGuard - Panel de Monitoreo de Incendios en Tiempo Real

Este proyecto es un panel de control web (dashboard) premium para visualizar en tiempo real las lecturas del detector de incendios basado en **ESP32**, **DHT11**, **MQ-2**, **LDR**, y el sensor de llama **KY-026**, utilizando **Firebase Realtime Database** para la sincronización de datos.

## Estructura del Proyecto Web

- [`index.html`](public/index.html): Estructura semántica del dashboard.
- [`styles.css`](public/styles.css): Estilos premium (modo oscuro, responsive, glassmorphism, alertas animadas).
- [`firebase-config.js`](public/firebase-config.js): Inicialización del SDK v10 de Firebase.
- [`app.js`](public/app.js): Lógica de escucha en tiempo real, gráficos (Chart.js) y exportación CSV.

---

## Cómo Probar Localmente

Dado que el código utiliza **ES Modules** (`import` / `export` en JS), abrir el archivo `index.html` directamente en el navegador con doble clic dará un error de CORS. Debes servirlo desde un servidor web local simple. Aquí tienes las opciones más fáciles:

### Opción A: Usando la extensión "Live Server" (Recomendada si usas VS Code)
1. Abre VS Code en la carpeta del proyecto.
2. Instala la extensión **Live Server** de *Ritwick Dey*.
3. Haz clic derecho sobre el archivo `index.html` y selecciona **Open with Live Server**.

### Opción B: Usando Python (Preinstalado en muchos sistemas)
Abre tu consola de comandos en la carpeta del proyecto y ejecuta:
```bash
python -m http.server 8000
```
Luego abre tu navegador en `http://localhost:8000`.

### Opción C: Usando Node.js / NPM (Si tienes Node instalado)
Abre la consola de comandos en la carpeta y ejecuta:
```bash
npx serve .
```
Luego abre la dirección que te indique la terminal (usualmente `http://localhost:3000` o `http://localhost:5000`).

---

## Cómo y Dónde Desplegar la Web (Deploy)

Como esta es una web estática (frontend puro), puedes alojarla de forma **100% gratuita** y muy segura. A continuación, tienes las mejores opciones detalladas paso a paso:

### Opción 1: Firebase Hosting (Recomendado, integrado con tu base de datos)
Firebase ofrece hosting gratis y rápido. Al usar el mismo proyecto que tu base de datos, es ideal.

1. **Instalar Firebase CLI** (necesitas Node.js instalado en tu PC):
   ```bash
   npm install -g firebase-tools
   ```
2. **Iniciar sesión en Firebase**:
   ```bash
   firebase login
   ```
   (Se abrirá tu navegador para loguearte con tu cuenta de Google asociada).
3. **Inicializar el proyecto**:
   En la raíz de la carpeta del proyecto, ejecuta:
   ```bash
   firebase init
   ```
   * Selecciona **Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Actions deploys**.
   * Elige **Use an existing project** y selecciona tu proyecto `arquiproy-1978e`.
   * Te preguntará: `What do you want to use as your public directory?`. Escribe `.` (un punto) para usar la carpeta actual, o si quieres ser más ordenado, puedes mover tus archivos a una carpeta llamada `public` e ingresar `public` (por defecto).
   * Te preguntará: `Configure as a single-page app (rewrite all urls to /index.html)?`. Responde `y` (sí).
   * Te preguntará: `Set up automatic builds and deploys with GitHub?`. Responde `n` (no).
   * Te preguntará si deseas sobrescribir `index.html`. Responde **`n` (no)** para no perder nuestro archivo diseñado.
4. **Desplegar la web**:
   Una vez configurado, ejecuta:
   ```bash
   firebase deploy
   ```
   Firebase te dará un enlace público permanente del tipo: `https://arquiproy-1978e.web.app` o `https://arquiproy-1978e.firebaseapp.com`.

---

### Opción 2: Vercel (La más rápida y sin consola de comandos)
Vercel es una plataforma de hosting ultra rápida para desarrolladores.

#### Vía Interfaz Web (Sin instalar nada):
1. Regístrate gratis en [vercel.com](https://vercel.com).
2. Descarga la carpeta de tu proyecto en tu computadora.
3. Ve a tu panel de Vercel y arrastra la carpeta del proyecto directamente a la sección de importar.
4. Vercel detectará el archivo `index.html` y lo desplegará en 5 segundos, dándote una URL gratuita (ejemplo: `nombre-proyecto.vercel.app`).

#### Vía Terminal (CLI):
1. Instala la herramienta de Vercel:
   ```bash
   npm install -g vercel
   ```
2. Inicia sesión y despliega con un solo comando:
   ```bash
   vercel
   ```
   * Sigue las instrucciones rápidas de la consola (presiona enter a casi todo) y estará publicado. Para producción definitiva, ejecuta `vercel --prod`.

---

### Opción 3: Netlify (Excelente alternativa drag-and-drop)
Netlify es similar a Vercel y es sumamente sencilla.

1. Regístrate gratis en [netlify.com](https://www.netlify.com).
2. Ve a la sección **Sites** de tu panel de administración.
3. En la parte inferior, verás un recuadro que dice **"Want to deploy a new site without connecting to Git? Drag and drop your site folder here"**.
4. Arrastra la carpeta completa del detector de incendios ahí.
5. En unos segundos, el sitio estará publicado con un enlace gratuito `nombre-aleatorio.netlify.app`, el cual puedes cambiar en los ajustes por un nombre personalizado gratis.
