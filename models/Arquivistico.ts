import mongoose from "mongoose";
import Bem from "./BemCultural";

// Modelo específico para documentos arquivísticos
const ArquivisticoSchema = new mongoose.Schema({
  codigoReferencia: { type: String},
  data: { type: String },
  nivelDescricao: { type: Number, enum: [0, 1]},
  dimensaoSuporte: { type: String},
  nomeProdutor: { type: String},
  historiaAdministrativaBiografia: { type: String },
  historiaArquivistica: { type: String },
  procedencia: { type: String },
  ambitoConteudo: { type: String },
  sistemaArranjo: { type: String },
  existenciaLocalizacaoOriginais: { type: String },
  notasConservacao: { type: String },
  pontosAcessoIndexacaoAssuntos: { type: String }
});

// Use discriminadores para distinguir os modelos
export const Arquivistico = Bem.discriminator("Arquivistico", ArquivisticoSchema);

