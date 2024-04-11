const mongoose = require('mongoose');

// Defina o modelo base genérico
const BemCultural = new mongoose.Schema({
  numeroRegistro: { type: String},
  outrosNumeros: { type: String },
  situacao: { type: String, enum: ['localizado', 'naoLocalizado', 'excluido']},
  titulo: { type: String},
  localProducao: { type: String },
  data: { type: String },
  materialTecnica: { type: String },
  resumoDescritivo: { type: String},
  estadoConservacao: { type: String},
  condicoesReproducao: { type: String},
  midiasRelacionadas: { type: [String] } // Pode ser uma lista de URLs ou referências
});

// Exporte o modelo base
module.exports = mongoose.model('Bem', BemCultural);
