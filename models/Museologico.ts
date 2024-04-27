import mongoose from "mongoose";
import Bem from "./BemCultural";

// Modelo específico para documentos museológicos
const MuseologicoSchema = new mongoose.Schema({
  numeroRegistro: { type: String, required: true },
  outrosNumeros: { type: String },
  situacao: { type: String },
  denominacao: { type: String, required: true },
  autor: { type: String },
  classificacao: { type: String },
  resumoDescritivo: { type: String },
  dimensoes: { type: String, required: true },
  materialTecnica: { type: String },
  estadoConservacao: { type: String },
  localProducao: { type: String },
  dataProducao: { type: String }


});

// Use discriminadores para distinguir os modelos
export default Bem.discriminator("Museologico", MuseologicoSchema);
