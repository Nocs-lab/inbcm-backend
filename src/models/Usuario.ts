import mongoose, { Schema, Types, Document } from "mongoose"
import { IProfile } from "./Profile"
import { IMuseu } from "./Museu"

export interface IUsuario extends Document {
  nome: string
  email: string
  museus: IMuseu[]
  admin: boolean
  senha: string
  profile: IProfile | Types.ObjectId
  ativo: boolean
  tipoAnalista: string[]
}

export const UsuarioSchema = new Schema<IUsuario>({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  admin: { type: Boolean, default: false },
  senha: { type: String, required: true },
  profile: { type: Schema.Types.ObjectId, required: true, ref: "profiles" },
  ativo: { type: Boolean, default: true },
  museus: [{ type: mongoose.Schema.Types.ObjectId, ref: "museus" }],
  tipoAnalista: [
    {
      type: String,
      enum: ["museologico", "arquivistico", "bibliografico"],
      default: []
    }
  ]
})

interface IRefreshToken extends Document {
  expiresAt: Date
  user: Types.ObjectId
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  expiresAt: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, requied: true, ref: "usuarios" }
})

export const Usuario = mongoose.model("usuarios", UsuarioSchema)
export const RefreshToken = mongoose.model("refreshToken", RefreshTokenSchema)
export default Usuario
