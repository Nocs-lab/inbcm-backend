const app = require('./app');
const conn = require("./db/conn.js");

conn();

const PORT = 3000;

// Inicializar o servidor
app.listen(PORT, function() {
    console.log(`Servidor funcionando na porta ${PORT}`);
});
