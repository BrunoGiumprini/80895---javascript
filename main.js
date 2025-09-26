// Globales
var STORAGE_KEY = "reservasSimpleV1"; // array de strings "HH:MM"
var horarioSelect = null;
var reservarBtn = null;
var verReservasBtn = null;
var cerrarPanelBtn = null;
var reservasPanel = null;
var reservasBody = null;
var msg = null;

// Genera horarios 08:00 a 19:00 cada 30'
function generarHorarios() {
  var lista = [];
  var h = 8;
  while (h <= 19) {
    var hh = h < 10 ? "0" + h : "" + h;
    lista.push(hh + ":00");
    if (h < 19) {
      lista.push(hh + ":30");
    }
    h = h + 1;
  }
  return lista;
}

// Storage básico
function cargarReservas() {
  var texto = localStorage.getItem(STORAGE_KEY);
  if (texto) {
    try {
      return JSON.parse(texto);
    } catch (e) {
      return [];
    }
  } else {
    return [];
  }
}

function guardarReservas(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// Llenar el <select> con horarios (desactiva los ocupados)
function armarSelect() {
  var horarios = generarHorarios();
  var reservas = cargarReservas();
  horarioSelect.innerHTML = "";
  for (var i = 0; i < horarios.length; i++) {
    var h = horarios[i];
    var op = document.createElement("option");
    op.value = h;
    if (reservas.indexOf(h) !== -1) {
      op.textContent = h + " (ocupado)";
      op.disabled = true;
    } else {
      op.textContent = h;
    }
    horarioSelect.appendChild(op);
  }
}

// Mostrar mensaje cortito
function setMensaje(texto) {
  msg.textContent = texto || "";
  if (setMensaje._t) {
    clearTimeout(setMensaje._t);
  }
  setMensaje._t = setTimeout(function () {
    msg.textContent = "";
  }, 2000);
}

// Reservar el valor seleccionado
function reservar() {
  var valor = horarioSelect.value;
  if (!valor) {
    return;
  }
  var reservas = cargarReservas();
  if (reservas.indexOf(valor) !== -1) {
    setMensaje("Ese horario ya está reservado.");
    return;
  }
  reservas.push(valor);
  guardarReservas(reservas);
  setMensaje("Reserva creada.");
  armarSelect();
  dibujarTabla();
}

// Armar tabla de reservas
function dibujarTabla() {
  var reservas = cargarReservas();
  reservasBody.innerHTML = "";
  if (reservas.length === 0) {
    var trVacio = document.createElement("tr");
    var tdVacio = document.createElement("td");
    tdVacio.colSpan = 3;
    tdVacio.textContent = "No tenés reservas.";
    trVacio.appendChild(tdVacio);
    reservasBody.appendChild(trVacio);
    return;
  }

  // copiar y ordenar(HH:MM)
  var copia = reservas.slice();
  copia.sort();

  for (var i = 0; i < copia.length; i++) {
    var h = copia[i];
    var tr = document.createElement("tr");

    var tdIdx = document.createElement("td");
    tdIdx.textContent = (i + 1);
    tr.appendChild(tdIdx);

    var tdHora = document.createElement("td");
    tdHora.textContent = h;
    tr.appendChild(tdHora);

    var tdAcc = document.createElement("td");
    var btn = document.createElement("button");
    btn.className = "btn-danger";
    btn.textContent = "Eliminar";
    btn.setAttribute("data-horario", h);
    tdAcc.appendChild(btn);
    tr.appendChild(tdAcc);

    reservasBody.appendChild(tr);
  }
}

// Eliminar por horario
function eliminarReservaPorHorario(horario) {
  var reservas = cargarReservas();
  var i = reservas.indexOf(horario);
  if (i !== -1) {
    reservas.splice(i, 1);
    guardarReservas(reservas);
    dibujarTabla();
    armarSelect();
    setMensaje("Reserva eliminada.");
  }
}

// Listeners
function prepararEventos() {
  reservarBtn.addEventListener("click", reservar);

  verReservasBtn.addEventListener("click", function () {
    dibujarTabla();
    reservasPanel.classList.remove("hidden");
  });

  cerrarPanelBtn.addEventListener("click", function () {
    reservasPanel.classList.add("hidden");
  });

  // Delegación para los botones "Eliminar"
  reservasBody.addEventListener("click", function (e) {
    var tgt = e.target;
    if (tgt && tgt.tagName === "BUTTON" && tgt.getAttribute("data-horario")) {
      var h = tgt.getAttribute("data-horario");
      eliminarReservaPorHorario(h);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  horarioSelect = document.getElementById("horarioSelect");
  reservarBtn = document.getElementById("reservarBtn");
  verReservasBtn = document.getElementById("verReservasBtn");
  cerrarPanelBtn = document.getElementById("cerrarPanel");
  reservasPanel = document.getElementById("reservasPanel");
  reservasBody = document.querySelector("#reservasTable tbody");
  msg = document.getElementById("msg");

  armarSelect();
  prepararEventos();
});
