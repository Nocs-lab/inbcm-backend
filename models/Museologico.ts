import mongoose from "mongoose";
import Bem from "./BemCultural";

// Modelo específico para documentos museológicos
const MuseologicoSchema = new mongoose.Schema({
  numeroRegistro: { type: String,alias:"nderegistro"},
  outrosNumeros: { type: String,alias:"outrosnumeros"},
  situacao: { type: String},
  denominacao: { type: String},
  autor: { type: String},
  classificacao: { type: String },
  resumoDescritivo: { type: String,alias:"resumodescritivo"},
  dimensoes: { type: String},
  materialTecnica: { type: String,alias:"materialtecnica" },
  estadoConservacao: { type: String,alias:"estadodeconservacao" },
  localProducao: { type: String,alias:"localdeproducao" },
  dataProducao: { type: String,alias:"datadeproducao"}


});

export const Museologico = Bem.discriminator("Museologico", MuseologicoSchema);

