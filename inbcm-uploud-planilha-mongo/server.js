import app from './app.js';
import conn from './db/conn.js';

conn();

const PORT = 3000;

// Inicializar o servidor
app.listen(PORT, function() {
    console.log(`Servidor funcionando na porta ${PORT}`);
});
