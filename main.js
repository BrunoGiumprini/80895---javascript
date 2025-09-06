function welcome() {
    console.log("Bienvenido al sistema de reservas de horarios");
    console.log("================================");
    console.log("1. Listar Horarios");
    console.log("2. Reservar Horario");
    console.log("3. Mis reservas");
    console.log("4. Eliminar Reserva");
    console.log("5. Salir");
}

function mostrarMenu() {
    console.log("1. Listar Horarios");
    console.log("2. Reservar Horario");
    console.log("3. Mis reservas");
    console.log("4. Eliminar Reserva");
    console.log("5. Salir");
}

const HORARIOS = ['8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
let HorariosDisponibles = [...HORARIOS];
let HorariosReservados = [];


function reservarHorario(horario) {
    let i = 0;
    while (HorariosDisponibles.length > 0 && horario != HorariosDisponibles[i]) {
        i++;
    }
    if (i < HorariosDisponibles.length) {
        HorariosReservados.push(HorariosDisponibles[i]);
        HorariosDisponibles.splice(i, 1);
        console.log("Horario reservado con éxito");
    } else {
        console.log("El horario no está disponible");
    }
}

function listarHorariosDisponibles() {
    if (HorariosDisponibles.length > 0) {
        console.log("Horarios disponibles:");
        for (let i = 0; i < HorariosDisponibles.length; i++) {
            console.log(HorariosDisponibles[i]);
        }
    } else {
        console.log("No hay horarios disponibles");
    }
}

function misReservas() {
    if (HorariosReservados.length > 0) {
        console.log("Tus horarios reservados son:");
        for (let i = 0; i < HorariosReservados.length; i++) {
            console.log(HorariosReservados[i]);
        }
    } else {
        console.log("No tienes horarios reservados");
    }
}

function eliminarReserva(horario) {
    let i = 0;
    while (i < HorariosReservados && horario != HorariosReservados[i]) {
        i++;
    }
    if (i < HorariosReservados.length) {
        HorariosDisponibles.push(HorariosReservados[i]);
        HorariosReservados.splice(i, 1);
        console.log("Reserva eliminada con éxito");
    } else {
        console.log("No tienes una reserva en ese horario");
    }
}

// 🔹 Confirmar antes de arrancar
if (confirm("¿Ya abriste la consola?")) {
    welcome();
    let opcion = prompt("¿Qué deseas hacer? (1-5)");
    while (opcion >= 1 && opcion < 5) {
        switch (opcion) {
            case "1":
                listarHorariosDisponibles();
                mostrarMenu();
                break;
            case "2":
                let horario = prompt("¿Qué horario deseas reservar? (Ej: 8:00)");
                reservarHorario(horario);
                mostrarMenu();
                break;
            case "3":
                misReservas();
                mostrarMenu();
                break;
            case "4":
                let horarioEliminar = prompt("¿Qué horario deseas eliminar? (Ej: 8:00)");
                eliminarReserva(horarioEliminar);
                mostrarMenu();
                break;
            case "5":
                console.log("Saliendo del sistema...");
                break;
        }
        opcion = prompt("¿Qué deseas hacer? (1-5)");
    }
} else {
    console.log("Por favor, abre la consola y recargá la página para empezar.");
}
