# 🔥 IgnisGuard - Sistema IoT de Monitoreo y Detección de Incendios en Tiempo Real

IgnisGuard es una solución IoT integral y premium diseñada para el monitoreo ambiental, prevención y alerta temprana de incendios. El sistema consta de un nodo de hardware basado en **ESP32** que recopila lecturas de telemetría y las transmite en tiempo real a **Firebase Realtime Database**, sincronizándose instantáneamente con este panel de control web (Dashboard) premium y de alta fidelidad.

---

## 🚀 Características Clave

* **Monitoreo Multivariable en Tiempo Real**: Visualización instantánea de lecturas críticas de sensores:
  * **Temperatura (°C)** y **Humedad (%)** ambiental (DHT11).
  * **Presencia de Gas (PPM)** tóxico e inflamable (MQ-2).
  * **Detección de Fuego (ADC)** por radiación infrarroja (Llama KY-026).
  * **Nivel de Luz** ambiental (LDR).
* **Gráficos Históricos Interactivos**: Tres gráficos independientes impulsados por **Chart.js** con auto-escala para analizar tendencias de Clima, Seguridad e Iluminación en los últimos 30 registros.
* **Sistema de Alertas Inteligentes (Toasts & Audio)**: Notificaciones emergentes diferenciadas por niveles de riesgo (Bajo, Medio, Alto, Crítico) con alarmas sonoras automáticas ante emergencias.
* **Diseño Ultra Premium (Nordic Obsidian)**: Interfaz de usuario moderna con estética oscura mate, tipografía Outfit pulida, componentes responsive y micro-interacciones sutiles libre de estilos genéricos.
* **Exportación de Datos**: Función integrada para descargar el historial de lecturas registradas directamente en formato **CSV**.

---

## 🛠️ Stack Tecnológico

### Hardware / Dispositivos IoT
* **Microcontrolador**: ESP32 (Wi-Fi integrado).
* **Sensores**: 
  * Sensor de temperatura y humedad DHT11.
  * Sensor de gas y humo MQ-2.
  * Sensor de llama infrarrojo KY-026.
  * Fotorresistencia LDR (Nivel de luz).

### Frontend & Cloud
* **Lenguajes**: HTML5 (Estructura Semántica) y CSS3 personalizado (Diseño de interfaz y variables responsivas).
* **Logic & SDK**: JavaScript ES6 (ES Modules) conectado al SDK v10 de **Firebase**.
* **Base de Datos**: Firebase Realtime Database.
* **Gráficos**: Chart.js por CDN.
* **Despliegue**: Firebase Hosting.

---

## 📂 Estructura del Repositorio

El proyecto web está organizado bajo las directrices oficiales de Firebase:

* **/public** *(Directorio principal del Frontend servido por el Hosting)*:
  * [`public/index.html`](file:///C:/Users/User/Desktop/Detector_incendios/public/index.html): Documento HTML5 semántico y estructurado.
  * [`public/styles.css`](file:///C:/Users/User/Desktop/Detector_incendios/public/styles.css): Hoja de estilos premium (paleta de colores obsidiana mate, tipografía, layouts y diseño adaptativo).
  * [`public/app.js`](file:///C:/Users/User/Desktop/Detector_incendios/public/app.js): Lógica de la aplicación, inicialización de gráficos de Chart.js y sincronización con los WebSockets de Firebase.
  * [`public/firebase-config.js`](file:///C:/Users/User/Desktop/Detector_incendios/public/firebase-config.js): Archivo de configuración del SDK de Firebase *(Nota: Ignorado en el repositorio mediante gitignore por motivos de seguridad)*.
* **Configuraciones de Firebase** *(Raíz)*:
  * [`firebase.json`](file:///C:/Users/User/Desktop/Detector_incendios/firebase.json): Configuración de reglas de Firebase Hosting.
  * [`.firebaserc`](file:///C:/Users/User/Desktop/Detector_incendios/.firebaserc): Definición del proyecto activo en la consola de Firebase.
  * [`.gitignore`](file:///C:/Users/User/Desktop/Detector_incendios/.gitignore): Exclusión de archivos sensibles.

---

## 💻 Ejecución Local

Dado que la aplicación web utiliza **ES Modules** (`import`/`export` nativos de JavaScript), por políticas de seguridad (CORS) de los navegadores no se puede abrir el archivo `index.html` haciendo doble clic de forma local. Es necesario levantarlo con un servidor web sencillo.

Aquí tienes tres formas rápidas de hacerlo:

### Opción 1: VS Code (Extensión Live Server)
1. Abre tu espacio de trabajo en VS Code.
2. Asegúrate de tener instalada la extensión **Live Server**.
3. Haz clic derecho sobre [`public/index.html`](file:///C:/Users/User/Desktop/Detector_incendios/public/index.html) y selecciona **Open with Live Server**.

### Opción 2: Usando Python (Consola)
Abre una terminal en la raíz del proyecto y ejecuta:
```bash
python -m http.server 8000
```
Luego accede a [http://localhost:8000/public](http://localhost:8000/public).

### Opción 3: Usando Node.js / NPM
Abre una terminal en la raíz del proyecto y ejecuta:
```bash
npx serve public
```
Abre la dirección devuelta en tu consola (generalmente [http://localhost:3000](http://localhost:3000)).

---

## ☁️ Despliegue en Producción (Firebase Hosting)

Para desplegar esta aplicación de forma gratuita en la nube de Firebase, sigue estos pasos:

1. **Instalar la CLI de Firebase** *(Requiere Node.js)*:
   ```bash
   npm install -g firebase-tools
   ```
2. **Iniciar Sesión**:
   ```bash
   firebase login
   ```
3. **Desplegar a Producción**:
   Dado que el archivo de configuración `firebase.json` ya apunta a la carpeta `public/` como el directorio estático del proyecto, simplemente ejecuta:
   ```bash
   firebase deploy
   ```
Una vez terminado el proceso, la CLI te proveerá el enlace público para acceder a la aplicación en línea.

---

## 🔒 Seguridad en Git

El proyecto incluye un archivo [`.gitignore`](file:///C:/Users/User/Desktop/Detector_incendios/.gitignore) preconfigurado que evita que credenciales privadas o tokens de conexión a Firebase (`firebase-config.js`) se guarden en repositorios públicos de GitHub. Asegúrate de crear tu propia configuración en `firebase-config.js` basándote en tu consola del proyecto.
