import mongoose from "mongoose";
import Bem from "./BemCultural";

// Modelo específico para documentos arquivísticos
const ArquivisticoSchema = new mongoose.Schema({
  codigoReferencia: { type: String,alias:"codigoreferencia"},
  data: { type: String},
  nivelDescricao: { type: Number, enum: [0, 1],alias:"niveldescricao" },
  dimensaoSuporte: { type: String,alias:"dimensaosuporte"},
  nomeProdutor: { type: String,alias:"nomeprodutor"},
  historiaAdministrativaBiografia: { type: String,alias:"historiaadministrativabiografia" },
  historiaArquivistica: { type: String,alias:"historiaarquivistica" },
  procedencia: { type: String },
  ambitoConteudo: { type: String,alias:"ambitoconteudo" },
  sistemaArranjo: { type: String,alias:"sistemarranjo" },
  existenciaLocalizacaoOriginais: { type: String,alias:"existencialocalizacao_originais"},
  notasConservacao: { type: String,alias:"notassobreconservacao" },
  pontosAcessoIndexacaoAssuntos: { type: String,alias:"pontosacessoindexacaoassuntos" }
});

// Use discriminadores para distinguir os modelos
export const Arquivistico = Bem.discriminator("Arquivistico", ArquivisticoSchema);

