import { db, ref, query, limitToLast, onChildAdded, onValue } from "./firebase-config.js";

// --- Variables de Estado Global ---
let chartClima = null;
let chartSeguridad = null;
let chartLuz = null;
const maxDataPoints = 30; // Cantidad máxima de puntos en el gráfico
let historicoDatos = []; // Para almacenar las lecturas cargadas
let ultimoEstado = null; // Para prevenir spam de alertas del mismo tipo

// --- Elementos de la Interfaz (DOM) ---
const elStatusDot = document.getElementById("status-dot");
const elStatusText = document.getElementById("status-text");

const elSystemBanner = document.getElementById("system-banner");
const elSystemStateVal = document.getElementById("system-state-val");
const elSystemStateDesc = document.getElementById("system-state-desc");
const elSystemTimeVal = document.getElementById("system-time-val");

// Tarjetas de Sensores
const valTemp = document.getElementById("val-temp");
const stateTemp = document.getElementById("state-temp");
const valHum = document.getElementById("val-hum");
const stateHum = document.getElementById("state-hum");
const valGas = document.getElementById("val-gas");
const stateGas = document.getElementById("state-gas");
const valLight = document.getElementById("val-light");
const stateLight = document.getElementById("state-light");
const valFlame = document.getElementById("val-flame");
const stateFlame = document.getElementById("state-flame");

// Contenedores de Historial
const elTableBody = document.getElementById("table-body");
const elLoadingSpinner = document.getElementById("loading-spinner");
const elBtnExport = document.getElementById("btn-export");
const elToastContainer = document.getElementById("toast-container");

// Audio para alertas críticas
const alertAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav");
alertAudio.volume = 0.5;

// --- 1. Inicialización de los Gráficos (Chart.js) ---
function inicializarGraficos() {
  const ctxClima = document.getElementById("chart-clima").getContext("2d");
  const ctxSeguridad = document.getElementById("chart-seguridad").getContext("2d");
  const ctxLuz = document.getElementById("chart-luz").getContext("2d");
  
  // Gráfico de Clima (Temperatura y Humedad)
  chartClima = new Chart(ctxClima, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Temperatura (°C)",
          borderColor: "#6366f1", // Indigo
          backgroundColor: "rgba(99, 102, 241, 0.03)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 1.5,
          data: []
        },
        {
          label: "Humedad (%)",
          borderColor: "#06b6d4", // Cyan
          backgroundColor: "rgba(6, 182, 212, 0.03)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 1.5,
          data: []
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#94a3b8", font: { family: "Outfit", size: 11 } } },
        tooltip: { backgroundColor: "#111317", titleColor: "#f1f5f9", bodyColor: "#cbd5e1" }
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.02)" },
          ticks: { color: "#64748b", font: { family: "Outfit", size: 10 } }
        },
        y: {
          min: 0,
          grid: { color: "rgba(255, 255, 255, 0.04)" },
          ticks: { color: "#94a3b8", font: { family: "Outfit", size: 10 } }
        }
      }
    }
  });

  // Gráfico de Seguridad (Gas y Fuego)
  chartSeguridad = new Chart(ctxSeguridad, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Gas MQ-2 (PPM)",
          borderColor: "#d97706", // Amber
          backgroundColor: "rgba(217, 119, 6, 0.02)",
          borderWidth: 2,
          tension: 0.25,
          pointRadius: 1.5,
          data: [],
          yAxisID: "y-gas"
        },
        {
          label: "Fuego (ADC Llama)",
          borderColor: "#e11d48", // Crimson
          backgroundColor: "rgba(225, 29, 72, 0.02)",
          borderWidth: 2,
          tension: 0.25,
          pointRadius: 1.5,
          data: [],
          yAxisID: "y-flame"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#94a3b8", font: { family: "Outfit", size: 11 } } },
        tooltip: { backgroundColor: "#111317", titleColor: "#f1f5f9", bodyColor: "#cbd5e1" }
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.02)" },
          ticks: { color: "#64748b", font: { family: "Outfit", size: 10 } }
        },
        "y-gas": {
          type: "linear",
          position: "left",
          min: 0,
          grid: { color: "rgba(255, 255, 255, 0.04)" },
          ticks: { color: "#d97706", font: { family: "Outfit", size: 10 } }
        },
        "y-flame": {
          type: "linear",
          position: "right",
          min: 0,
          max: 4095,
          grid: { drawOnChartArea: false },
          ticks: { color: "#e11d48", font: { family: "Outfit", size: 10 } }
        }
      }
    }
  });

  // Gráfico de Iluminación (Luz)
  chartLuz = new Chart(ctxLuz, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Nivel de Luz",
          borderColor: "#10b981", // Emerald
          backgroundColor: "rgba(16, 185, 129, 0.02)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 1.5,
          data: []
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#94a3b8", font: { family: "Outfit", size: 11 } } },
        tooltip: { backgroundColor: "#111317", titleColor: "#f1f5f9", bodyColor: "#cbd5e1" }
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.02)" },
          ticks: { color: "#64748b", font: { family: "Outfit", size: 10 } }
        },
        y: {
          min: 0,
          grid: { color: "rgba(255, 255, 255, 0.04)" },
          ticks: { color: "#94a3b8", font: { family: "Outfit", size: 10 } }
        }
      }
    }
  });
}

// --- 2. Gestión de Alertas y Notificaciones (Toasts) ---
function mostrarToast(titulo, mensaje, tipo) {
  const id = "toast-" + Date.now();
  
  let iconClass = "fa-circle-info";
  if (tipo === "danger") iconClass = "fa-triangle-exclamation";
  if (tipo === "warning") iconClass = "fa-circle-exclamation";
  if (tipo === "medium") iconClass = "fa-temperature-high";

  const toastHTML = `
    <div class="toast toast-${tipo}" id="${id}">
      <div class="toast-icon">
        <i class="fa-solid ${iconClass}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${titulo}</div>
        <div class="toast-message">${mensaje}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    </div>
  `;

  elToastContainer.insertAdjacentHTML("beforeend", toastHTML);

  // Reproducir sonido si es una alerta crítica o alta
  if (tipo === "danger" || tipo === "warning") {
    alertAudio.play().catch(err => console.log("Permiso de audio requerido por el navegador."));
  }

  // Eliminar automáticamente después de 6 segundos
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) {
      el.style.animation = "slide-in 0.3s reverse forwards";
      setTimeout(() => el.remove(), 300);
    }
  }, 6000);
}

// --- 3. Actualización de Interfaz con Nuevos Datos ---
function actualizarUI(data) {
  // A. Banner de Estado General
  const cat = data.categoria || "Indeterminado";
  
  // Limpiar clases de estado anteriores
  elSystemBanner.className = "system-state-banner";
  
  let descText = "Monitoreando variables del entorno. Todo seguro.";
  
  if (cat === "Bajo") {
    elSystemBanner.classList.add("state-bajo");
    elSystemStateVal.innerHTML = `<i class="fa-solid fa-shield-halved"></i> AMBIENTE SEGURO`;
    descText = "Todos los sensores reportan niveles nominales y normales.";
  } else if (cat === "Medio") {
    elSystemBanner.classList.add("state-medio");
    elSystemStateVal.innerHTML = `<i class="fa-solid fa-temperature-high"></i> ALERTA MEDIA: CALOR`;
    descText = "Se ha detectado una temperatura elevada (> 28.1°C). Monitoreando.";
  } else if (cat === "Alto") {
    elSystemBanner.classList.add("state-alto");
    elSystemStateVal.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> RIESGO ALTO`;
    descText = "Valores de Gas (>300 PPM) o Iluminación (>8000 Luz) fuera del rango común.";
  } else if (cat === "Critico") {
    elSystemBanner.classList.add("state-critico");
    elSystemStateVal.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> AMBIENTE CRÍTICO`;
    descText = "¡FUEGO DETECTADO O FUGA MASIVA DE GAS (>1500 PPM)!";
  }
  
  elSystemStateDesc.textContent = descText;
  elSystemTimeVal.textContent = data.fecha_hora || "---";

  // B. Tarjeta de Temperatura
  valTemp.innerHTML = `${Number(data.temperatura).toFixed(1)}<span class="sensor-unit">°C</span>`;
  if (data.temperatura > 28.1) {
    stateTemp.className = "sensor-status badge-medio";
    stateTemp.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> Elevada`;
  } else {
    stateTemp.className = "sensor-status badge-bajo";
    stateTemp.innerHTML = `<i class="fa-solid fa-check"></i> Normal`;
  }

  // C. Tarjeta de Humedad
  valHum.innerHTML = `${Number(data.humedad).toFixed(0)}<span class="sensor-unit">%</span>`;
  stateHum.className = "sensor-status badge-bajo";
  stateHum.innerHTML = `<i class="fa-solid fa-check"></i> Estable`;

  // D. Tarjeta de Gas MQ-2
  const gasPpm = Number(data.gas_mq2);
  valGas.innerHTML = `${gasPpm.toFixed(1)}<span class="sensor-unit">PPM</span>`;
  if (gasPpm > 1500) {
    stateGas.className = "sensor-status badge-critico";
    stateGas.innerHTML = `<i class="fa-solid fa-skull-crossbones"></i> Crítico`;
  } else if (gasPpm > 300) {
    stateGas.className = "sensor-status badge-alto";
    stateGas.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Fuga Leve`;
  } else {
    stateGas.className = "sensor-status badge-bajo";
    stateGas.innerHTML = `<i class="fa-solid fa-check"></i> Seguro`;
  }

  // E. Tarjeta de Luz LDR
  const luzLux = Number(data.luz_ldr);
  valLight.innerHTML = `${luzLux.toFixed(0)}<span class="sensor-unit">Luz</span>`;
  if (luzLux > 8000) {
    stateLight.className = "sensor-status badge-alto";
    stateLight.innerHTML = `<i class="fa-solid fa-sun"></i> Luz Intensa`;
  } else {
    stateLight.className = "sensor-status badge-bajo";
    stateLight.innerHTML = `<i class="fa-solid fa-moon"></i> Normal`;
  }

  // F. Tarjeta de Fuego Llama (KY-026)
  // ADC: menor valor = más llama. En el ESP32, nivelLlama < 2000 es fuego.
  const adcFlame = Number(data.llama_ky026);
  if (adcFlame < 2000) {
    valFlame.innerHTML = `FUEGO<span class="sensor-unit">(${adcFlame})</span>`;
    stateFlame.className = "sensor-status badge-critico";
    stateFlame.innerHTML = `<i class="fa-solid fa-fire-flame-curved"></i> DETECTADO`;
  } else {
    valFlame.innerHTML = `SEGURO<span class="sensor-unit">(${adcFlame})</span>`;
    stateFlame.className = "sensor-status badge-bajo";
    stateFlame.innerHTML = `<i class="fa-solid fa-shield"></i> Sin Llama`;
  }

  // G. Disparar Toast si hay cambio de estado de riesgo a niveles peligrosos
  if (cat !== ultimoEstado) {
    if (cat === "Critico") {
      const causa = adcFlame < 2000 ? "¡FUEGO DETECTADO EN LA ZONA!" : "Fuga masiva de gas tóxico";
      mostrarToast("PELIGRO EXTREMO", causa, "danger");
    } else if (cat === "Alto") {
      mostrarToast("ADVERTENCIA DE RIESGO", "Niveles de gas moderados o anomalía de luz intensa.", "warning");
    } else if (cat === "Medio") {
      mostrarToast("Alerta de Calor", "La temperatura ambiental supera los 28.1°C.", "medium");
    }
    ultimoEstado = cat;
  }
}

// --- 4. Gestión del Gráfico Histórico ---
function actualizarGrafico(data) {
  if (!chartClima || !chartSeguridad || !chartLuz) return;

  // Extraer hora formateada (HH:MM:SS) de fecha_hora (ej. "2026-06-26 15:24:08")
  let horaFormateada = "---";
  if (data.fecha_hora && data.fecha_hora.includes(" ")) {
    horaFormateada = data.fecha_hora.split(" ")[1];
  } else if (data.fecha_hora) {
    horaFormateada = data.fecha_hora;
  }

  // A. Gráfico Clima
  chartClima.data.labels.push(horaFormateada);
  chartClima.data.datasets[0].data.push(data.temperatura);
  chartClima.data.datasets[1].data.push(data.humedad);

  // B. Gráfico Seguridad
  chartSeguridad.data.labels.push(horaFormateada);
  chartSeguridad.data.datasets[0].data.push(data.gas_mq2);
  chartSeguridad.data.datasets[1].data.push(data.llama_ky026);

  // C. Gráfico Luz
  chartLuz.data.labels.push(horaFormateada);
  chartLuz.data.datasets[0].data.push(data.luz_ldr);

  // Mantener la cantidad de puntos fijada en maxDataPoints
  if (chartClima.data.labels.length > maxDataPoints) {
    chartClima.data.labels.shift();
    chartClima.data.datasets[0].data.shift();
    chartClima.data.datasets[1].data.shift();
  }
  if (chartSeguridad.data.labels.length > maxDataPoints) {
    chartSeguridad.data.labels.shift();
    chartSeguridad.data.datasets[0].data.shift();
    chartSeguridad.data.datasets[1].data.shift();
  }
  if (chartLuz.data.labels.length > maxDataPoints) {
    chartLuz.data.labels.shift();
    chartLuz.data.datasets[0].data.shift();
  }

  chartClima.update();
  chartSeguridad.update();
  chartLuz.update();
}

// --- 5. Llenado de la Tabla de Historial ---
function agregarFilaTabla(data, prepend = true) {
  // Ocultar spinner si está visible
  if (elLoadingSpinner) elLoadingSpinner.style.display = "none";

  let claseFila = "";
  if (data.categoria === "Critico") claseFila = "row-critico";
  else if (data.categoria === "Alto") claseFila = "row-alto";

  let badgeClase = "badge-bajo";
  if (data.categoria === "Medio") badgeClase = "badge-medio";
  else if (data.categoria === "Alto") badgeClase = "badge-alto";
  else if (data.categoria === "Critico") badgeClase = "badge-critico";

  const rowHTML = `
    <tr class="${claseFila}">
      <td style="font-weight: 600;">${data.fecha_hora}</td>
      <td>
        <span class="threshold-badge ${badgeClase}">${data.categoria}</span>
      </td>
      <td>${Number(data.temperatura).toFixed(1)} °C</td>
      <td>${Number(data.humedad).toFixed(0)} %</td>
      <td>${Number(data.gas_mq2).toFixed(1)} PPM</td>
      <td>${Number(data.luz_ldr).toFixed(0)} Luz</td>
      <td>${data.llama_ky026} ADC</td>
    </tr>
  `;

  if (prepend) {
    elTableBody.insertAdjacentHTML("afterbegin", rowHTML);
    // Controlar filas en tabla (máximo 50 en la vista de la UI)
    if (elTableBody.children.length > 50) {
      elTableBody.lastElementChild.remove();
    }
  } else {
    elTableBody.insertAdjacentHTML("beforeend", rowHTML);
  }
}

// --- 6. Exportar Historial a CSV ---
function exportarHistorialACSV() {
  if (historicoDatos.length === 0) {
    alert("No hay datos históricos cargados para exportar.");
    return;
  }

  // Definir cabecera y filas
  const headers = ["Fecha y Hora", "Categoría", "Temperatura (C)", "Humedad (%)", "Gas MQ-2 (PPM)", "Nivel de Luz", "Fuego KY-026 (ADC)"];
  
  const csvRows = [headers.join(",")];
  
  // Mapear los datos de historicoDatos (ordenados por fecha de más antiguo a más nuevo)
  const datosOrdenados = [...historicoDatos].sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
  
  for (const row of datosOrdenados) {
    const values = [
      `"${row.fecha_hora}"`,
      `"${row.categoria}"`,
      row.temperatura,
      row.humedad,
      row.gas_mq2,
      row.luz_ldr,
      row.llama_ky026
    ];
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `historial_incendios_${Date.now()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- 7. Inicialización y Escucha de Firebase ---
function conectarFirebase() {
  // A. Monitorear estado de conexión
  const statusRef = ref(db, ".info/connected");
  onValue(statusRef, (snapshot) => {
    if (snapshot.val() === true) {
      elStatusDot.className = "status-dot online";
      elStatusText.textContent = "Conectado a Firebase";
    } else {
      elStatusDot.className = "status-dot offline";
      elStatusText.textContent = "Buscando servidor...";
    }
  });

  // B. Cargar últimos datos e iniciar listener en tiempo real
  // Usamos limitToLast(50) para obtener el histórico más reciente
  const historialRef = ref(db, "historial");
  const consultaHistorial = query(historialRef, limitToLast(50));

  let cargaInicialCompletada = false;
  const bufferInicial = [];

  onChildAdded(consultaHistorial, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    historicoDatos.push(data);

    if (!cargaInicialCompletada) {
      bufferInicial.push(data);
    } else {
      // Flujo en tiempo real después de la carga inicial
      actualizarUI(data);
      actualizarGrafico(data);
      agregarFilaTabla(data, true);
    }
  });

  // Usamos un listener onValue temporal para saber cuándo se ha terminado la carga inicial de los 50 elementos
  onValue(consultaHistorial, (snapshot) => {
    if (cargaInicialCompletada) return; // Solo ejecutar una vez
    
    cargaInicialCompletada = true;

    // Ordenar buffer inicial de más antiguo a más nuevo para el gráfico y render de la tabla
    bufferInicial.sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));

    if (bufferInicial.length > 0) {
      // 1. Quitar spinner de carga
      if (elLoadingSpinner) elLoadingSpinner.style.display = "none";

      // 2. Poblar el gráfico con los datos del buffer
      bufferInicial.forEach(d => {
        actualizarGrafico(d);
      });

      // 3. Poblar la tabla de historial (se insertan prepend=true pero yendo de antiguo a nuevo para que el más nuevo quede arriba)
      bufferInicial.forEach(d => {
        agregarFilaTabla(d, true);
      });

      // 4. Actualizar la UI del panel principal con la lectura más reciente
      const ultimaLectura = bufferInicial[bufferInicial.length - 1];
      actualizarUI(ultimaLectura);
    } else {
      // No hay datos en Firebase
      if (elLoadingSpinner) {
        elLoadingSpinner.innerHTML = `
          <i class="fa-solid fa-database-open" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
          <span>No hay lecturas registradas. Esperando datos del ESP32...</span>
        `;
      }
    }
  }, { onlyOnce: true });
}

// --- 8. Event Listeners y Arranque ---
document.addEventListener("DOMContentLoaded", () => {
  inicializarGraficos();
  conectarFirebase();
  
  if (elBtnExport) {
    elBtnExport.addEventListener("click", exportarHistorialACSV);
  }
});
