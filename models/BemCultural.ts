import mongoose, { Schema } from "mongoose";

// Defina o modelo base genérico
const BemCulturalSchema = new mongoose.Schema({
  titulo: { type: String},
  condicoesReproducao: { type: String,alias:"condicoesreproducao"},
  midiasRelacionadas: { type: [String] },
  declaracao_ref: [{ type: Schema.Types.ObjectId, required: true, ref: "Declaracoes" }],
  versao: { type: Number, default: 0 }, 
},{versionKey: false});

const BemCultural = mongoose.model("bens", BemCulturalSchema);


export default BemCultural;
