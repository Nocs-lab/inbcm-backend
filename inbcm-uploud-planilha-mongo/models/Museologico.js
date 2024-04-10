const mongoose = require('mongoose');

const museologicoSchema = new mongoose.Schema({
  numeroRegistro: { type: String, required: true },
  outrosNumeros: { type: String },
  situacao: { type: String, enum: ['localizado', 'naoLocalizado', 'excluido'], required: true },
  denominacao: { type: String, required: true },
  titulo: { type: String },
  autor: { type: String, required: true },
  classificacao: { type: String },
  resumoDescritivo: { type: String, required: true },
  dimensoes: { type: String, required: true },
  materialTecnica: { type: String, required: true },
  estadoConservacao: { type: String, required: true },
  localProducao: { type: String },
  dataProducao: { type: String },
  condicoesReproducao: { type: String, required: true },
  midiasRelacionadas: { type: [String] } // Pode ser uma lista de URLs ou referências
});

const MuseologicoModel = mongoose.model('Museologico', museologicoSchema);

module.exports = MuseologicoModel;
