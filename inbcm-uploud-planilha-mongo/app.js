const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes'); // Importar as rotas

const app = express();

// Configurar middlewares
app.use(cors());
app.use(express.json());

// Usar as rotas importadas
app.use('/api', routes);

// Exportar a aplicação configurada
module.exports = app;
