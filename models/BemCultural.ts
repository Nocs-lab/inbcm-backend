import mongoose from "mongoose";

// Defina o modelo base genérico
const BemCulturalSchema = new mongoose.Schema({
  numeroRegistro: { type: String },
  outrosNumeros: { type: String },
  situacao: { type: String, enum: ["localizado", "naoLocalizado", "excluido"] },
  titulo: { type: String },
  localProducao: { type: String },
  data: { type: String },
  materialTecnica: { type: String },
  resumoDescritivo: { type: String },
  estadoConservacao: { type: String },
  condicoesReproducao: { type: String },
  midiasRelacionadas: { type: [String] }, // Pode ser uma lista de URLs ou referências
});

// Crie o modelo BemCultural com o esquema definido
const BemCultural = mongoose.model("bens", BemCulturalSchema);

// Exporte o modelo base
export default BemCultural;
