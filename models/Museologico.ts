import mongoose from "mongoose";
import Bem from "./BemCultural";

// Modelo específico para documentos museológicos
const MuseologicoSchema = new mongoose.Schema({
  numeroRegistro: { type: String},
  outrosNumeros: { type: String },
  situacao: { type: String },
  denominacao: { type: String},
  autor: { type: String},
  classificacao: { type: String },
  resumoDescritivo: { type: String },
  dimensoes: { type: String},
  materialTecnica: { type: String },
  estadoConservacao: { type: String },
  localProducao: { type: String },
  dataProducao: { type: String }


});

// Use discriminadores para distinguir os modelos
export default Bem.discriminator("Museologico", MuseologicoSchema);
