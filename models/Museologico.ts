import mongoose from "mongoose";
import Bem from "./BemCultural";

// Modelo específico para documentos museológicos
const MuseologicoSchema = new mongoose.Schema({
  numeroRegistro: { type: String,alias:"numeroDeRegistro"},
  outrosNumeros: { type: String},
  situacao: { type: String },
  denominacao: { type: String},
  autor: { type: String},
  classificacao: { type: String },
  resumoDescritivo: { type: String},
  dimensoes: { type: String},
  materialTecnica: { type: String },
  estadoConservacao: { type: String,alias:"estadoDeConservacao" },
  localProducao: { type: String,alias:"localDeProducao" },
  dataProducao: { type: String,alias:"dataDeProducao"}


});

export const Museologico = Bem.discriminator("Museologico", MuseologicoSchema);

