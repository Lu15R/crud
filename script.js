// Enviar datos a MySQL cuando el formulario se envíe
document.getElementById("formulario").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const switchEstado = document.getElementById("bd_switch").checked;

    if (!switchEstado) {
        // Enviar datos a MySQL si el switch está apagado
        const response = await fetch("http://localhost:3000/agregar", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        alert(result.message);
    } else {
        alert("MongoDB aún no está implementado.");
    }
});

// Función para obtener los datos de MySQL y mostrarlos en la tabla
async function cargarDatos() {
    const response = await fetch("http://localhost:3000/datos");
    const data = await response.json();

    const tbody = document.querySelector("#tabla_datos tbody");
    tbody.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos datos

    data.forEach((item) => {
        const tr = document.createElement("tr");
        tr.id = `registro_${item.id}`;
        tr.innerHTML = `
            <td>${item.id}</td>
            <td class="texto">${item.texto}</td>
            <td class="password">${item.password}</td>
            <td class="texto_largo">${item.texto_largo}</td>
            <td class="fecha">${item.fecha}</td>
            <td>${item.imagen ? `<img src="uploads/${item.imagen}" alt="imagen" width="100">` : "No hay imagen"}</td>
            <td>
                <button class="btn btn-warning" onclick="editarRegistro(${item.id})">Editar</button>
                <button class="btn btn-danger" onclick="eliminarRegistro(${item.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para eliminar un registro
async function eliminarRegistro(id) {
    const response = await fetch(`http://localhost:3000/eliminar/${id}`, {
        method: "DELETE",
    });

    const result = await response.json();
    alert(result.message);

    // Recargar los datos después de eliminar
    cargarDatos();
}

// Mostrar formulario de edición con los datos actuales
function editarRegistro(id) {
    const registro = document.querySelector(`#registro_${id}`);

    document.getElementById("id_editar").value = id;
    document.getElementById("texto_editar").value = registro.querySelector(".texto").textContent;
    document.getElementById("password_editar").value = registro.querySelector(".password").textContent;
    document.getElementById("texto_largo_editar").value = registro.querySelector(".texto_largo").textContent;
    document.getElementById("fecha_editar").value = registro.querySelector(".fecha").textContent;

    document.getElementById("form_editar").style.display = "block";
}

// Guardar los cambios realizados
async function guardarEdicion() {
    const id = document.getElementById("id_editar").value;
    const texto = document.getElementById("texto_editar").value;
    const password = document.getElementById("password_editar").value;
    const texto_largo = document.getElementById("texto_largo_editar").value;
    const fecha = document.getElementById("fecha_editar").value;

    const response = await fetch(`http://localhost:3000/actualizar/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            texto,
            password,
            texto_largo,
            fecha,
        }),
    });

    const result = await response.json();
    alert(result.message);

    // Ocultar el formulario y recargar los datos
    document.getElementById("form_editar").style.display = "none";
    cargarDatos();
}

// Cargar los datos cuando la página cargue
window.onload = cargarDatos;
