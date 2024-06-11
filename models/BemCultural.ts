import mongoose, { Schema } from "mongoose";

// Defina o modelo base genérico
const BemCulturalSchema = new mongoose.Schema({
  titulo: { type: String},
  condicoesReproducao: { type: String,alias:"condicoesDeReproducao"},
  midiasRelacionadas: { type: [String] }, // Pode ser uma lista de URLs ou referências
  declaracao_ref: { type: Schema.Types.ObjectId, required: true, ref: "Declaracoes" },
});

// Crie o modelo BemCultural com o esquema definido
const BemCultural = mongoose.model("bens", BemCulturalSchema);

// Exporte o modelo base
export default BemCultural;
