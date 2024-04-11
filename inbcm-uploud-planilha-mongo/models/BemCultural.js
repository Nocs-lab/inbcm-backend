const mongoose = require('mongoose');

// Defina o modelo base genérico
const BemCultural = new mongoose.Schema({
  numeroRegistro: { type: String, required: true },
  outrosNumeros: { type: String },
  situacao: { type: String, enum: ['localizado', 'naoLocalizado', 'excluido'], required: true },
  titulo: { type: String, required: true },
  localProducao: { type: String },
  data: { type: String },
  materialTecnica: { type: String },
  resumoDescritivo: { type: String, required: true },
  estadoConservacao: { type: String, required: true },
  condicoesReproducao: { type: String, required: true },
  midiasRelacionadas: { type: [String] } // Pode ser uma lista de URLs ou referências
});

// Exporte o modelo base
module.exports = mongoose.model('Bem', BemCultural);
