const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("uploads")); // Carpeta para guardar imágenes

// 📌 Configurar conexión a MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Coloca tu contraseña si tienes
    database: "formulario_crud",
});

// 📌 Verificar conexión a MySQL
db.connect((err) => {
    if (err) {
        console.error("Error de conexión a MySQL:", err);
    } else {
        console.log("✅ Conectado a MySQL");
    }
});

// Ruta para la página principal
app.get("/", (req, res) => {
    res.send("Servidor Express funcionando correctamente.");
});

// 📌 Configurar almacenamiento de imágenes con Multer
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

// 📌 Ruta para insertar datos en MySQL
app.post("/agregar", upload.single("imagen"), (req, res) => {
    const { texto, password, texto_largo, fecha } = req.body;
    const imagen = req.file ? req.file.filename : null;

    const sql = "INSERT INTO formulario (texto, password, texto_largo, fecha, imagen) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [texto, password, texto_largo, fecha, imagen], (err, result) => {
        if (err) {
            console.error("Error al insertar datos:", err);
            res.status(500).json({ message: "Error al insertar datos" });
        } else {
            res.status(200).json({ message: "Datos guardados en MySQL" });
        }
    });
});

// 📌 Ruta para obtener los datos de MySQL
app.get("/datos", (req, res) => {
    const sql = "SELECT * FROM formulario";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener datos:", err);
            res.status(500).json({ message: "Error al obtener datos" });
        } else {
            res.status(200).json(results);
        }
    });
});

// 📌 Ruta para eliminar un dato por ID
app.delete("/eliminar/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM formulario WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar:", err);
            res.status(500).json({ message: "Error al eliminar" });
        } else {
            res.status(200).json({ message: "Registro eliminado" });
        }
    });
});

// 📌 Ruta para actualizar un dato por ID
app.put("/actualizar/:id", upload.single("imagen"), (req, res) => {
    const { id } = req.params;
    const { texto, password, texto_largo, fecha } = req.body;
    const imagen = req.file ? req.file.filename : null;

    let sql;
    let valores;

    if (imagen) {
        // Si hay una nueva imagen, actualizarla también
        sql = "UPDATE formulario SET texto = ?, password = ?, texto_largo = ?, fecha = ?, imagen = ? WHERE id = ?";
        valores = [texto, password, texto_largo, fecha, imagen, id];
    } else {
        // Si no hay nueva imagen, solo actualizar los demás campos
        sql = "UPDATE formulario SET texto = ?, password = ?, texto_largo = ?, fecha = ? WHERE id = ?";
        valores = [texto, password, texto_largo, fecha, id];
    }

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error("Error al actualizar datos:", err);
            res.status(500).json({ message: "Error al actualizar datos" });
        } else {
            res.status(200).json({ message: "Registro actualizado correctamente" });
        }
    });
});

// 📌 Iniciar servidor
const PORT = 3000; // Puedes cambiar el puerto si es necesario
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
