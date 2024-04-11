const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const filaSchema = new Schema({
  nome: String, // Nome do arquivo
  caminho: String, // Caminho completo do arquivo (ex: uploads/planilha.xlsx)
  dataEnvio: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Fila', filaSchema);
