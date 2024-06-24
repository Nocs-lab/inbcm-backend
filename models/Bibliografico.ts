import mongoose from "mongoose";
import Bem from "./BemCultural";

// Modelo específico para documentos bibliográficos
const BibliograficoSchema = new mongoose.Schema({
  numeroRegistro: { type: String,alias:"nderegistro"},
  outrosNumeros: { type: String,alias:"outrosnumeros" },
  situacao: { type: String },
  tipo: { type: String},
  identificacaoResponsabilidade: { type: String,alias:"identificacaoresponsabilidade"},
  localProducao: { type: String,alias:"localproducao" },
  editora: { type: String},
  data: { type: String,alias:"datadeproducao" },
  dimensaoFisica: { type: String,alias:"dimensaofisica"},
  materialTecnica: { type: String,alias:"materialtecnica"},
  encadernacao: { type: String },
  resumoDescritivo: { type: String,alias:"resumodescritivo" },
  estadoConservacao: { type: String,alias:"estadoconservacao" },
  assuntoPrincipal: { type: String,alias:"assuntoprincipal"},
  assuntoCronologico: { type: String,alias:"assuntocronologico" },
  assuntoGeografico: { type: String,alias:"assuntogeografico" }


});

// Use discriminadores para distinguir os modelos
export const Bibliografico = Bem.discriminator("Bibliografico", BibliograficoSchema);
