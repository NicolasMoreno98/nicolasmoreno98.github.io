const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  credentials: true
}));

app.use("/api/auth", require("./routes/authRoutes"));

const startServer = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/ajedrez");

    console.log("✅ MongoDB conectado");
    app.listen(3000, () => {
      console.log("🚀 Servidor corriendo en http://localhost:3000");
    });
  } catch (err) {
    console.error("❌ Error al conectar MongoDB:", err.message);
  }
};

app.use("/api/partidas", require("./routes/partidaRoutes"));

startServer();
