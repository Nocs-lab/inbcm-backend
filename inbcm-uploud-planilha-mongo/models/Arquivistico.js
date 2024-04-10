const mongoose = require('mongoose');

const arquivisticoSchema = new mongoose.Schema({
  codigoReferencia: { type: String, required: true },
  titulo: { type: String, required: true },
  data: { type: String, required: true },
  nivelDescricao: { type: Number, enum: [0, 1], required: true },
  dimensaoSuporte: { type: String, required: true },
  nomeProdutor: { type: String, required: true },
  historiaAdministrativaBiografia: { type: String },
  historiaArquivistica: { type: String },
  procedencia: { type: String },
  ambitoConteudo: { type: String },
  sistemaArranjo: { type: String },
  condicoesReproducao: { type: String, required: true },
  existenciaLocalizacaoOriginais: { type: String },
  notasConservacao: { type: String },
  pontosAcessoIndexacaoAssuntos: { type: String },
  midiasRelacionadas: { type: [String] } 
});

const arquivisticoModel = mongoose.model('Arquivistico', arquivisticoSchema);

module.exports = arquivisticoModel;
