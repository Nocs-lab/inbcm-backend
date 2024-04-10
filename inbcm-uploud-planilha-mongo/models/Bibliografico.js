const mongoose = require('mongoose');

const bibliograficoSchema = new mongoose.Schema({
  numeroRegistro: { type: String, required: true },
  outrosNumeros: { type: String },
  situacao: { type: String, enum: ['localizado', 'naoLocalizado', 'excluido'], required: true },
  titulo: { type: String, required: true },
  tipo: { type: String, required: true },
  identificacaoResponsabilidade: { type: String, required: true },
  localProducao: { type: String, required: true },
  editora: { type: String, required: true },
  data: { type: String, required: true },
  dimensaoFisica: { type: String, required: true },
  materialTecnica: { type: String },
  encadernacao: { type: String },
  resumoDescritivo: { type: String, required: true },
  estadoConservacao: { type: String, required: true },
  assuntoPrincipal: { type: String, required: true },
  assuntoCronologico: { type: String },
  assuntoGeografico: { type: String },
  condicoesReproducao: { type: String, required: true },
  midiasRelacionadas: { type: [String] } // Pode ser uma lista de URLs ou referências
});

const bibliograficoModel = mongoose.model('Bibliografico', bibliograficoSchema);

module.exports = bibliograficoModel;
