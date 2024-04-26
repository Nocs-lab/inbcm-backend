import mongoose from "mongoose";
import Bem from "./BemCultural";

// Modelo específico para documentos bibliográficos
const BibliograficoSchema = new mongoose.Schema({
  numeroRegistro: { type: String, required: true },
  outrosNumeros: { type: String },
  situacao: { type: String },

  tipo: { type: String, required: true },
  identificacaoResponsabilidade: { type: String, required: true },
  localProducao: { type: String },
  editora: { type: String, required: true },
  data: { type: String },
  dimensaoFisica: { type: String, required: true },
  materialTecnica: { type: String },
  encadernacao: { type: String },
  resumoDescritivo: { type: String },
  estadoConservacao: { type: String },
  assuntoPrincipal: { type: String, required: true },
  assuntoCronologico: { type: String },
  assuntoGeografico: { type: String }


});

// Use discriminadores para distinguir os modelos
const Bibliografico = Bem.discriminator("Bibliografico", BibliograficoSchema);

export default Bibliografico;
