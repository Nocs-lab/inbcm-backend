import mongoose, { Schema, Types, Document } from "mongoose";

interface IUsuario extends Document {
  nome: string
  email: string
  museus: string[]
  admin: boolean
  senha: string
  papel_usuario: string
}

const UsuarioSchema = new Schema<IUsuario>({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  admin: { type: Boolean, default: false },
  senha: { type: String, required: true },
  papel_usuario: { type: String, enum: ["administrador", "analista", "tecnico"], default: "tecnico" },
});

interface IRefreshToken extends Document {
  expiresAt: Date
  user: Types.ObjectId
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  expiresAt: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, requied: true, ref: "usuarios" }
})

export const Usuario = mongoose.model("usuarios", UsuarioSchema);
export const RefreshToken = mongoose.model("refreshToken", RefreshTokenSchema);
export default Usuario;
