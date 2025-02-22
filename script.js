document.getElementById("formulario").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const switchEstado = document.getElementById("bd_switch").checked;

    if (!switchEstado) {

        const response = await fetch("http://localhost:3000/agregar", {
            method: "POST",
            body: formData,
        });
        const result = await response.json();
        alert(result.message);
        window.location.reload();
    } else {

        const response = await fetch("http://localhost:3000/agregarMongo", {
            method: "POST",
            body: formData,
        });
        const result = await response.json();
        alert(result.message);
        window.location.reload();
    }
});

document.getElementById("imagen").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      alert('Selecciona una imagen')
      e.target.value = "";  
    }
  });

async function cargarDatos() {
    const switchEstado = document.getElementById("bd_switch").checked;
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
    const switchEstado = document.getElementById("bd_switch").checked;
    const url = switchEstado ? `http://localhost:3000/eliminarMongo/${id}` : `http://localhost:3000/eliminar/${id}`;

    const response = await fetch(url, { method: "DELETE" });
    const result = await response.json();
    alert(result.message);
    cargarDatos();
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

    
    document.getElementById("form_editar").style.display = "block";
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

    const switchEstado = document.getElementById("bd_switch").checked;
    const url = switchEstado ? `http://localhost:3000/actualizarMongo/${id}` : `http://localhost:3000/actualizar/${id}`;

    const response = await fetch(url, {
         method: "PUT",
         body: formData
    });

    const result = await response.json();
    alert(result.message);
    document.getElementById("form_editar").style.display = "none";
    cargarDatos();
}



window.onload = cargarDatos;


document.getElementById("bd_switch").addEventListener("change", cargarDatos);

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
});


function actualizarTituloDatos() {
    const switchEstado = document.getElementById("bd_switch").checked;
    const titulo = document.getElementById("titulo_datos");
    titulo.textContent = switchEstado ? "Datos guardados en MongoDB" : "Datos guardados en MySQL";
}


document.getElementById("bd_switch").addEventListener("change", () => {
    actualizarTituloDatos();
    cargarDatos();
});


window.onload = () => {
    actualizarTituloDatos();
    cargarDatos();
};
