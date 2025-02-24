const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("uploads"));

// Configurar conexión a MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "formulario_crud",
});

// Verificar conexión a MySQL
db.connect((err) => {
    if (err) {
        console.error("Error de conexión a MySQL:", err);
    } else {
        console.log("✅ Conectado a MySQL");
    }
});

// Conectar a MongoDB con Mongoose
mongoose.connect("mongodb://localhost:27017/formulario_crud", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado a MongoDB"))
.catch((err) => console.error("Error de conexión a MongoDB:", err));

// Definir el Schema y Modelo para MongoDB
const formularioSchema = new mongoose.Schema({
    texto: { type: String, required: true },
    password: { type: String, required: true },
    texto_largo: { type: String, required: true },
    fecha: { type: Date, required: true },
    imagen: { type: String, default: null },
});
const Formulario = mongoose.model("Formulario", formularioSchema);

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

// Función de validación
function validarTextoLargo(textoLargo) {
    return !(/^\s|\s$|\s{2,}/.test(textoLargo));
}

// Ruta para la página principal
app.get("/", (req, res) => {
    res.send("Servidor Express funcionando correctamente.");
});

// POST - Insertar datos en MySQL
app.post("/agregar", upload.single("imagen"), (req, res) => {
    const { texto, password, texto_largo, fecha } = req.body;
    if (!validarTextoLargo(texto_largo)) {
        return res.status(400).json({ message: "No se permiten espacios en blanco en el campo Texto Largo." });
    }
    const imagen = req.file ? req.file.filename : null;

    const sql = "INSERT INTO formulario (texto, password, texto_largo, fecha, imagen) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [texto, password, texto_largo, fecha, imagen], (err, result) => {
        if (err) {
            console.error("Error al insertar datos en MySQL:", err);
            res.status(500).json({ message: "Error al insertar datos en MySQL" });
        } else {
            res.status(200).json({ message: "Datos guardados en MySQL" });
        }
    });
});

// GET - Obtener datos de MySQL
app.get("/datos", (req, res) => {
    const sql = "SELECT * FROM formulario";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener datos de MySQL:", err);
            res.status(500).json({ message: "Error al obtener datos de MySQL" });
        } else {
            res.status(200).json(results);
        }
    });
});

// DELETE - Eliminar un dato por ID en MySQL
app.delete("/eliminar/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM formulario WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar en MySQL:", err);
            res.status(500).json({ message: "Error al eliminar en MySQL" });
        } else {
            res.status(200).json({ message: "Registro eliminado de MySQL" });
        }
    });
});

// PUT - Actualizar un dato por ID en MySQL
app.put("/actualizar/:id", upload.single("imagen"), (req, res) => {
    const { id } = req.params;
    const { texto, password, texto_largo, fecha } = req.body;
    if (!validarTextoLargo(texto_largo)) {
        return res.status(400).json({ message: "No se permiten espacios en blanco en el campo Texto Largo." });
    }
    const imagen = req.file ? req.file.filename : null;

    let sql;
    let valores;

    if (imagen) {
        sql = "UPDATE formulario SET texto = ?, password = ?, texto_largo = ?, fecha = ?, imagen = ? WHERE id = ?";
        valores = [texto, password, texto_largo, fecha, imagen, id];
    } else {
        sql = "UPDATE formulario SET texto = ?, password = ?, texto_largo = ?, fecha = ? WHERE id = ?";
        valores = [texto, password, texto_largo, fecha, id];
    }

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error("Error al actualizar datos en MySQL:", err);
            res.status(500).json({ message: "Error al actualizar datos en MySQL" });
        } else {
            res.status(200).json({ message: "Registro actualizado en MySQL" });
        }
    });
});

// POST - Insertar datos en MongoDB
app.post("/agregarMongo", upload.single("imagen"), async (req, res) => {
    try {
        const { texto, password, texto_largo, fecha } = req.body;
        if (!validarTextoLargo(texto_largo)) {
            return res.status(400).json({ message: "No se permiten espacios en blanco en el campo Texto Largo." });
        }
        const imagen = req.file ? req.file.filename : null;

        const nuevoFormulario = new Formulario({
            texto,
            password,
            texto_largo,
            fecha,
            imagen,
        });

        await nuevoFormulario.save();
        res.status(200).json({ message: "Datos guardados en MongoDB" });
    } catch (error) {
        console.error("Error al insertar datos en MongoDB:", error);
        res.status(500).json({ message: "Error al insertar datos en MongoDB" });
    }
});

// GET - Obtener datos de MongoDB
app.get("/datosMongo", async (req, res) => {
    try {
        const datos = await Formulario.find();
        res.status(200).json(datos);
    } catch (error) {
        console.error("Error al obtener datos de MongoDB:", error);
        res.status(500).json({ message: "Error al obtener datos de MongoDB" });
    }
});

// DELETE - Eliminar un dato por ID en MongoDB
app.delete("/eliminarMongo/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Formulario.findByIdAndDelete(id);
        res.status(200).json({ message: "Registro eliminado de MongoDB" });
    } catch (error) {
        console.error("Error al eliminar en MongoDB:", error);
        res.status(500).json({ message: "Error al eliminar en MongoDB" });
    }
});

// PUT - Actualizar un dato por ID en MongoDB......
app.put("/actualizarMongo/:id", upload.single("imagen"), async (req, res) => {
    try {
        const { id } = req.params;
        const { texto, password, texto_largo, fecha } = req.body;
        if (!validarTextoLargo(texto_largo)) {
            return res.status(400).json({ message: "No se permiten espacios en blanco en el campo Texto Largo." });
        }
        const imagen = req.file ? req.file.filename : null;

        const updateData = { texto, password, texto_largo, fecha };
        if (imagen) {
            updateData.imagen = imagen;
        }

        await Formulario.findByIdAndUpdate(id, updateData);
        res.status(200).json({ message: "Registro actualizado en MongoDB" });
    } catch (error) {
        console.error("Error al actualizar en MongoDB:", error);
        res.status(500).json({ message: "Error al actualizar en MongoDB" });
    }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});