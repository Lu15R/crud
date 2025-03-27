// VALIDACIÓN Y ENVÍO DEL FORMULARIO PRINCIPAL
document.getElementById("formulario").addEventListener("submit", async function (event) {
    event.preventDefault();
    const textoLargo = document.getElementById('texto_largo').value;
    const password = document.getElementById('password').value;
    
    // Validar que "Texto Largo" no comience ni termine con espacios
    if (/^\s/.test(textoLargo) || /\s$/.test(textoLargo)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El campo Texto Largo no debe comenzar ni terminar con espacios.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    
    // Validar que la contraseña contenga solo letras (incluyendo Ñ/ñ), números y puntos
    if (!/^[A-Za-zÑñ0-9.]+$/.test(password)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La contraseña solo puede contener letras, números y puntos.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    
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

// VALIDACIÓN PARA LA SELECCIÓN DE IMAGEN (FORMULARIO PRINCIPAL)
document.getElementById("imagen").addEventListener("change", function (e) {
    const file = e.target.files[0];
    const maxSize = 2 * 1024 * 1024; // 2 MB

    if (file) {
        if (!file.type.startsWith("image/")) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Selecciona una imagen',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Entendido'
            });
            e.target.value = "";
        } else if (file.size > maxSize) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La imagen no debe superar los 2 MB',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Entendido'
            });
            e.target.value = "";
        }
    }
});

// CARGAR Y MOSTRAR TODOS LOS REGISTROS EN LA TABLA DE DATOS
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

// ELIMINAR REGISTRO CON CONFIRMACIÓN
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

// ABRIR MODAL Y CARGAR DATOS EN EL FORMULARIO DE EDICIÓN
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

    // VALIDACIÓN PARA LA SELECCIÓN DE IMAGEN EN EL FORMULARIO DE EDICIÓN
    document.getElementById("imagen_editar").addEventListener("change", function (e) {
        const file = e.target.files[0];
        const maxSize = 2 * 1024 * 1024; // 2 MB

        if (file) {
            if (!file.type.startsWith("image/")) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Selecciona una imagen',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Entendido'
                });
                e.target.value = "";
            } else if (file.size > maxSize) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'La imagen no debe superar los 2 MB',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Entendido'
                });
                e.target.value = "";
            }
        }
    });
}

// GUARDAR LA EDICIÓN
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

// VALIDACIÓN Y ENVÍO DEL FORMULARIO DEL MODAL DE EDICIÓN
document.getElementById('form_editar').addEventListener('submit', function(event) {
    event.preventDefault();
    const textoLargoEditar = document.getElementById('texto_largo_editar').value;
    const passwordEditar = document.getElementById('password_editar').value;

    if (/^\s/.test(textoLargoEditar) || /\s$/.test(textoLargoEditar)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El campo "Texto Largo" no debe comenzar ni terminar con espacios.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    if (!/^[A-Za-zÑñ0-9.]+$/.test(passwordEditar)) {
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

// FUNCION PARA CERRAR EL MODAL
function cerrarModal() {
    document.getElementById("modal_editar").style.display = "none";
}

// INICIALIZACIÓN: CARGA DE DATOS Y ACTUALIZACIÓN DE TÍTULOS
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

// ACTUALIZAR TEXTOS DE LOS SWITCHES SEGÚN SU ESTADO
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

// ACTUALIZAR TÍTULO DE LA SECCIÓN DE DATOS SEGÚN LA BASE DE DATOS SELECCIONADA
function actualizarTituloDatos() {
    const switchEstado = document.getElementById("tabla_switch").checked;
    const titulo = document.getElementById("titulo_datos");
    if(titulo) {
      titulo.textContent = switchEstado ? "Datos guardados en MongoDB" : "Datos guardados en MySQL";
    }
}

// NUEVA FUNCIÓN PARA LA BÚSQUEDA DE REGISTROS
function buscarRegistros(query) {
    const switchEstado = document.getElementById("tabla_switch").checked;
    let url;
    if (switchEstado) {
      // Búsqueda en MongoDB
      url = `http://localhost:3000/buscarMongo?query=${encodeURIComponent(query)}`;
    } else {
      // Búsqueda en MySQL
      url = `http://localhost:3000/buscar?query=${encodeURIComponent(query)}`;
    }
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector("#tabla_busqueda tbody");
        tbody.innerHTML = "";
        
        if (data.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin coincidencias',
            text: 'No se han encontrado coincidencias',
            confirmButtonColor: '#3085d6'
          });
          return;
        }
        
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
            
          `;
          tbody.appendChild(tr);
        });
      })
      .catch(error => console.error('Error en la búsqueda:', error));
  }
  

// EVENTOS PARA LA BARRA DE BÚSQUEDA (botón y Enter)
document.getElementById('search-button').addEventListener('click', () => {
  const query = document.getElementById('search-input').value.trim();
  buscarRegistros(query);
});

document.getElementById('search-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const query = this.value.trim();
    buscarRegistros(query);
  }
});
