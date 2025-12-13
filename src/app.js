const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.routes");
const errorMiddleware = require("./middlewares/error.middleware");
const compression = require("compression");

const app = express();

app.use(compression());
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);


// Middleware global pour la gestion des erreurs
app.use(errorMiddleware);

module.exports = app;
