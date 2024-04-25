import mongoose from "mongoose";

// Defina o modelo base genérico
const UsuarioSchema = new mongoose.Schema({
  numeroRegistro: { type: String },
  id_user: { type: Number },
  nome: { type: String },
  email: { type: String },
  museu: { type: String },
  cpf: { type: String },
});

// Crie o modelo Usuario com o esquema definido
const Usuario = mongoose.model("usuarios", UsuarioSchema);

// Exporte o modelo base
export default Usuario;
