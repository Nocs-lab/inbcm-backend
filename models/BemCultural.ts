import mongoose from "mongoose";

// Defina o modelo base genérico
const BemCulturalSchema = new mongoose.Schema({
  titulo: { type: String},
  condicoesReproducao: { type: String,alias:"condicoesDeReproducao"},
  midiasRelacionadas: { type: [String] }, // Pode ser uma lista de URLs ou referências
});

// Crie o modelo BemCultural com o esquema definido
const BemCultural = mongoose.model("bens", BemCulturalSchema);

// Exporte o modelo base
export default BemCultural;
