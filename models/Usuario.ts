import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from 'mongoose-sequence';

const AutoIncrement = AutoIncrementFactory(mongoose);

const UsuarioSchema = new Schema({
  id_user: { type: Number },
  nome: { type: String, required: true },
  acervo: { type: String, required: true },
  museu: { type: String, required: true },
  ano: { type: String, required: true },
});

UsuarioSchema.plugin(AutoIncrement, { inc_field: 'id_user' });

const Usuario = mongoose.model("usuarios", UsuarioSchema);

export default Usuario;
