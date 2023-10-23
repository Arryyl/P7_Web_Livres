const express = require("express");

const dotenv = require("dotenv");
const result = dotenv.config();

const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");
const path = require("path");

const mongoose = require("mongoose");

const app = express();

//MIDDLEWARE UTILISÉ POUR ANALYSER LES DONNÉES JSON DES REQUETES
app.use(express.json());

//MIDDLEWARE QUI GÈRE LES AUTORISATION D'ACCÈS, LES EN-TETES SPECIFIES ET LES DIFFÉRENTES METHODES
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

//CONNEXION AVEC LA BASE DE DONNEES MONGODB
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

//ROUTES
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", userRoutes);
app.use("/api/books", bookRoutes);

app.listen(4000);