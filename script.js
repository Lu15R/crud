document.getElementById("formulario").addEventListener("submit", async function (event) {
    const textoLargo = document.getElementById('texto_largo').value;
    const password = document.getElementById('password').value;
    if (/^\s|\s$|\s{2,}/.test(textoLargo)) {
        event.preventDefault();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se permiten espacios en blanco en el campo Texto Largo.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    if (!/^[A-Za-z0-9.]*$/.test(password)) {
        event.preventDefault();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La contraseña solo puede contener letras, números y puntos.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    event.preventDefault();
    const formData = new FormData(this);
    const switchEstado = document.getElementById("bd_switch").checked;
    const url = switchEstado ? "http://localhost:3000/agregarMongo" : "http://localhost:3000/agregar";
    const response = await fetch(url, {
        method: "POST",
        body: formData,
    });
    const result = await response.json();
    if (!response.ok) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.message,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: result.message,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    }).then(() => {
        window.location.reload();
    });
});

document.getElementById("imagen").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Selecciona una imagen',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Entendido'
        });
        e.target.value = "";
    }
});

async function cargarDatos() {
    const switchEstado = document.getElementById("tabla_switch").checked;
    const url = switchEstado ? "http://localhost:3000/datosMongo" : "http://localhost:3000/datos";
    const response = await fetch(url);
    const data = await response.json();
    const tbody = document.querySelector("#tabla_datos tbody");
    tbody.innerHTML = "";
    data.forEach((item) => {
        const id = item.id || item._id;
        const tr = document.createElement("tr");
        tr.id = `registro_${id}`;
        tr.innerHTML = `
            <td>${id}</td>
            <td class="texto">${item.texto}</td>
            <td class="password">${item.password}</td>
            <td class="texto_largo">${item.texto_largo}</td>
            <td class="fecha">${new Date(item.fecha).toLocaleDateString()}</td>
            <td>${item.imagen ? `<img src="uploads/${item.imagen}" alt="imagen" width="100">` : "No hay imagen"}</td>
            <td>
                <button class="btn btn-warning" onclick="editarRegistro('${id}')">Editar</button>
                <button class="btn btn-danger" onclick="eliminarRegistro('${id}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function eliminarRegistro(id) {
    Swal.fire({
        title: '¡Cuidado!',
        text: '¿Estás seguro de que quieres continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, adelante',
        cancelButtonText: 'No, cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const switchEstado = document.getElementById("tabla_switch").checked;
            const url = switchEstado ? `http://localhost:3000/eliminarMongo/${id}` : `http://localhost:3000/eliminar/${id}`;
            const response = await fetch(url, { method: "DELETE" });
            const result = await response.json();
            Swal.fire({
                icon: 'success',
                title: '¡Hecho!',
                text: 'La operación fue exitosa.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
            cargarDatos();
        }
    });
}

function editarRegistro(id) {
    const registro = document.querySelector(`#registro_${id}`);
    document.getElementById("id_editar").value = id;
    document.getElementById("texto_editar").value = registro.querySelector(".texto").textContent;
    document.getElementById("password_editar").value = registro.querySelector(".password").textContent;
    document.getElementById("texto_largo_editar").value = registro.querySelector(".texto_largo").textContent;
    document.getElementById("fecha_editar").value = registro.querySelector(".fecha").textContent;
    const imgTag = document.getElementById("imagen_preview");
    const imgElemento = registro.querySelector("td img");
    if (imgElemento) {
        imgTag.src = imgElemento.src;
        imgTag.style.display = "block";
    } else {
        imgTag.style.display = "none";
        imgTag.src = "";
    }
    document.getElementById("modal_editar").style.display = "block";
}

async function guardarEdicion() {
    const id = document.getElementById("id_editar").value;
    const texto = document.getElementById("texto_editar").value;
    const password = document.getElementById("password_editar").value;
    const texto_largo = document.getElementById("texto_largo_editar").value;
    const fecha = document.getElementById("fecha_editar").value;
    const imagenFile = document.getElementById("imagen_editar").files[0];
    const formData = new FormData();
    formData.append("texto", texto);
    formData.append("password", password);
    formData.append("texto_largo", texto_largo);
    formData.append("fecha", fecha);
    if (imagenFile) {
        formData.append("imagen", imagenFile);
    }
    const switchEstado = document.getElementById("tabla_switch").checked;
    const url = switchEstado ? `http://localhost:3000/actualizarMongo/${id}` : `http://localhost:3000/actualizar/${id}`;
    const response = await fetch(url, { method: "PUT", body: formData });
    const result = await response.json();
    if (!response.ok) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.message,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: result.message,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    }).then(() => {
        document.getElementById("modal_editar").style.display = "none";
        cargarDatos();
    });
}

document.getElementById('form_editar').addEventListener('submit', function(event) {
    const textoLargoEditar = document.getElementById('texto_largo_editar').value;
    const passwordEditar = document.getElementById('password_editar').value;
    if (/^\s|\s$|\s{2,}/.test(textoLargoEditar)) {
        event.preventDefault();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se permiten espacios en blanco en el campo Texto Largo.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    if (!/^[A-Za-z0-9.]*$/.test(passwordEditar)) {
        event.preventDefault();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La contraseña solo puede contener letras, números y puntos.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    guardarEdicion();
});

function cerrarModal() {
    document.getElementById("modal_editar").style.display = "none";
}

window.onload = () => {
    actualizarTituloDatos();
    cargarDatos();
};

document.getElementById("bd_switch").addEventListener("change", () => {
    actualizarTituloDatos();
});

document.getElementById("tabla_switch").addEventListener("change", () => {
    actualizarTituloDatos();
    cargarDatos();
});

document.addEventListener("DOMContentLoaded", function () {
    const bdSwitch = document.getElementById("bd_switch");
    const switchLabel = document.getElementById("switchLabel");
    bdSwitch.addEventListener("change", function () {
        if (bdSwitch.checked) {
            switchLabel.textContent = "Almacenar datos en MongoDB (Desliza para cambiar)";
        } else {
            switchLabel.textContent = "Almacenar datos en MySQL (Desliza para cambiar)";
        }
    });

    const tablaSwitch = document.getElementById("tabla_switch");
    const tablaSwitchLabel = document.getElementById("tablaSwitchLabel");
    tablaSwitch.addEventListener("change", function () {
        if (tablaSwitch.checked) {
            tablaSwitchLabel.textContent = "Mostrar datos de MongoDB (Desliza para cambiar)";
        } else {
            tablaSwitchLabel.textContent = "Mostrar datos de MySQL (Desliza para cambiar)";
        }
    });
});

function actualizarTituloDatos() {
    const switchEstado = document.getElementById("tabla_switch").checked;
    const titulo = document.getElementById("titulo_datos");
    titulo.textContent = switchEstado ? "Datos guardados en MongoDB" : "Datos guardados en MySQL";
}
