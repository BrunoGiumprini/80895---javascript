// Almacenamos reservas en localStorage bajo esta clave.
// El rango horario y el intervalo permiten ajustar fácilmente la grilla.
const STORAGE_KEY = "reservas_v2";
const HORARIO_INICIO = 8;   // 08:00
const HORARIO_FIN = 19;     // 19:30 (se completa con :30 hasta la hora final)
const INTERVALO_MIN = 30;   // Minutos (actual lógica usa :00 y :30)
let propiedadSelect, fechaInput, horarioSelect;
let reservarBtn, verReservasBtn, cerrarPanelBtn;
let reservasPanel, reservasBody, msg;

// ================== “Datos remotos” simulados (JSON asíncrono) ==================
const PROPIEDADES = [
  { id: "p1", nombre: "Casa Parque Rodó — 1 dorm", direccion: "Ejido 1234" },
  { id: "p2", nombre: "Apartamento Tres Cruces — 2 dorm", direccion: "Av. Italia 2500" },
  { id: "p3", nombre: "Loft Cordón — Estudio", direccion: "Gonzalo Ramírez 999" }
];

async function cargarPropiedadesAsync() {
  const blob = new Blob([JSON.stringify(PROPIEDADES)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    URL.revokeObjectURL(url);
    // Simulamos request real con un pequeño delay
    await new Promise(r => setTimeout(r, 250));
    return data;
  } catch {
    URL.revokeObjectURL(url);
    return [];
  }
}

// Fecha de hoy en formato YYYY-MM-DD (para validar y precargar)
function hoyISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// Genera la grilla de horarios: 08:00, 08:30, …, 19:30
function generarHorarios() {
  const lista = [];
  for (let h = HORARIO_INICIO; h <= HORARIO_FIN; h++) {
    const hh = String(h).padStart(2, "0");
    lista.push(`${hh}:00`);
    if (h < HORARIO_FIN) lista.push(`${hh}:30`);
  }
  return lista;
}

// Lectura/escritura de reservas en localStorage (persistencia simple)
function leerReservas() {
  try {
    const texto = localStorage.getItem(STORAGE_KEY);
    return texto ? JSON.parse(texto) : [];
  } catch {
    return [];
  }
}
function guardarReservas(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// Mensaje breve en pantalla
function setMensaje(texto) {
  msg.textContent = texto || "";
  if (setMensaje._t) clearTimeout(setMensaje._t);
  setMensaje._t = setTimeout(() => (msg.textContent = ""), 2000);
}

// ID pseudo-único para identificar reservas en la tabla
function idReserva() {
  return Math.random().toString(36).slice(2, 10);
}

// ================== Render: carga de propiedades y horarios ==================
// Llena el <select> de propiedades con datos “remotos”
async function poblarPropiedades() {
  const props = await cargarPropiedadesAsync();
  propiedadSelect.innerHTML = "";
  for (const p of props) {
    const op = document.createElement("option");
    op.value = p.id;
    op.textContent = p.nombre;
    op.title = p.direccion;
    propiedadSelect.appendChild(op);
  }
  // Precarga la primera propiedad si existe
  if (props.length) propiedadSelect.value = props[0].id;
}

// Llena el <select> de horarios según la propiedad y fecha elegidas,
// deshabilitando aquellos ya reservados para ese contexto.
function armarSelectHorarios() {
  const seleccion = {
    propertyId: propiedadSelect.value,
    date: fechaInput.value
  };
  const reservas = leerReservas();
  const ocupados = new Set(
    reservas
      .filter(r => r.propertyId === seleccion.propertyId && r.date === seleccion.date)
      .map(r => r.time)
  );

  const horarios = generarHorarios();
  horarioSelect.innerHTML = "";
  for (const h of horarios) {
    const op = document.createElement("option");
    op.value = h;
    if (ocupados.has(h)) {
      op.textContent = `${h} (ocupado)`;
      op.disabled = true;
    } else {
      op.textContent = h;
    }
    horarioSelect.appendChild(op);
  }
}

// Dibuja la tabla de reservas (orden: fecha → hora → propiedad)
function dibujarTabla() {
  const reservas = [...leerReservas()].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.time !== b.time) return a.time.localeCompare(b.time);
    return a.propertyName.localeCompare(b.propertyName);
  });

  reservasBody.innerHTML = "";
  if (!reservas.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = "No tenés reservas.";
    tr.appendChild(td);
    reservasBody.appendChild(tr);
    return;
  }

  reservas.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${r.propertyName}</td>
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>
        <button class="btn-danger" data-id="${r.id}">Eliminar</button>
      </td>
    `;
    reservasBody.appendChild(tr);
  });
}

// Validación mínima de selección (propiedad, fecha válida y horario)
function validarSeleccion() {
  const propertyId = propiedadSelect.value;
  const date = fechaInput.value;
  const time = horarioSelect.value;

  if (!propertyId) return { ok: false, msg: "Seleccioná una propiedad." };
  if (!date) return { ok: false, msg: "Seleccioná una fecha." };
  if (!time) return { ok: false, msg: "Seleccioná un horario." };
  if (date < hoyISO()) return { ok: false, msg: "La fecha no puede ser pasada." };
  return { ok: true };
}

// Crea una reserva si no existe otra igual
async function reservar() {
  const chk = validarSeleccion();
  if (!chk.ok) {
    await Swal.fire({ icon: "warning", text: chk.msg, confirmButtonText: "Ok" });
    return;
  }

  const propertyId = propiedadSelect.value;
  const propertyName = propiedadSelect.options[propiedadSelect.selectedIndex]?.textContent || "";
  const date = fechaInput.value;
  const time = horarioSelect.value;

  const reservas = leerReservas();
  const existe = reservas.some(r => r.propertyId === propertyId && r.date === date && r.time === time);
  if (existe) {
    await Swal.fire({ icon: "error", text: "Ese turno ya está reservado.", confirmButtonText: "Entendido" });
    armarSelectHorarios();
    return;
  }

  reservas.push({ id: idReserva(), propertyId, propertyName, date, time });
  guardarReservas(reservas);
  setMensaje("Reserva creada.");
  armarSelectHorarios();
  dibujarTabla();
}

// Elimina una reserva por id
async function eliminarReservaPorId(id) {
  const { isConfirmed } = await Swal.fire({
    icon: "question",
    title: "¿Eliminar reserva?",
    text: "Esta acción no se puede deshacer.",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });
  if (!isConfirmed) return;

  const reservas = leerReservas();
  const idx = reservas.findIndex(r => r.id === id);
  if (idx !== -1) {
    reservas.splice(idx, 1);
    guardarReservas(reservas);
    dibujarTabla();
    armarSelectHorarios();
    setMensaje("Reserva eliminada.");
  }
}

// ================== Enlaces de eventos y arranque ==================
// Asocia listeners y realiza la primera carga/render
function prepararEventos() {
  reservarBtn.addEventListener("click", reservar);
  verReservasBtn.addEventListener("click", () => {
    dibujarTabla();
    reservasPanel.classList.remove("hidden");
  });
  cerrarPanelBtn.addEventListener("click", () => {
    reservasPanel.classList.add("hidden");
  });
  propiedadSelect.addEventListener("change", armarSelectHorarios);
  fechaInput.addEventListener("change", armarSelectHorarios);
  reservasBody.addEventListener("click", e => {
    const btn = e.target;
    if (btn && btn.matches("button[data-id]")) {
      eliminarReservaPorId(btn.getAttribute("data-id"));
    }
  });
}

// Hook de inicio: obtiene nodos, setea fecha mínima y hace la primera carga
document.addEventListener("DOMContentLoaded", async () => {
  propiedadSelect = document.getElementById("propiedadSelect");
  fechaInput = document.getElementById("fechaInput");
  horarioSelect = document.getElementById("horarioSelect");
  reservarBtn = document.getElementById("reservarBtn");
  verReservasBtn = document.getElementById("verReservasBtn");
  cerrarPanelBtn = document.getElementById("cerrarPanel");
  reservasPanel = document.getElementById("reservasPanel");
  reservasBody = document.querySelector("#reservasTable tbody");
  msg = document.getElementById("msg");

  fechaInput.min = hoyISO();
  fechaInput.value = hoyISO();

  await poblarPropiedades();
  armarSelectHorarios();
  prepararEventos();
});
