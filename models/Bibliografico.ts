import mongoose from "mongoose";
import Bem from "./BemCultural";

// Modelo específico para documentos bibliográficos
const BibliograficoSchema = new mongoose.Schema({
  numeroRegistro: { type: String},
  outrosNumeros: { type: String },
  situacao: { type: String },
  tipo: { type: String},
  identificacaoResponsabilidade: { type: String},
  localProducao: { type: String },
  editora: { type: String},
  data: { type: String },
  dimensaoFisica: { type: String},
  materialTecnica: { type: String },
  encadernacao: { type: String },
  resumoDescritivo: { type: String },
  estadoConservacao: { type: String },
  assuntoPrincipal: { type: String},
  assuntoCronologico: { type: String },
  assuntoGeografico: { type: String }


});

// Use discriminadores para distinguir os modelos
const Bibliografico = Bem.discriminator("Bibliografico", BibliograficoSchema);

export default Bibliografico;
