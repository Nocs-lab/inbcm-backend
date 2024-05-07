import mongoose from "mongoose";
import Bem from "./BemCultural";

// Modelo específico para documentos museológicos
const MuseologicoSchema = new mongoose.Schema({
  numeroRegistro: { type: String,alias:"numeroDeRegistro"},
  outrosNumeros: { type: String,alias:"outrosNumeros"},
  situacao: { type: String },
  denominacao: { type: String},
  autor: { type: String},
  classificacao: { type: String },
  resumoDescritivo: { type: String,alias:"resumoDescritivo" },
  dimensoes: { type: String,alias:"dimensoes"},
  materialTecnica: { type: String,alias:"materialTecnica" },
  estadoConservacao: { type: String,alias:"estadoDeConservacao" },
  localProducao: { type: String,alias:"localDeProducao" },
  dataProducao: { type: String,alias:"dataDeProducao"}


});

// Use discriminadores para distinguir os modelos
export default Bem.discriminator("Museologico", MuseologicoSchema);
