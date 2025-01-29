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
  especialidadeAnalista: string[]
  cpf: string
}

export const UsuarioSchema = new Schema<IUsuario>({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  admin: { type: Boolean, default: false },
  senha: { type: String, required: true },
  profile: { type: Schema.Types.ObjectId, required: true, ref: "profiles" },
  ativo: { type: Boolean, default: true },
  museus: [{ type: mongoose.Schema.Types.ObjectId, ref: "museus" }],
  especialidadeAnalista: [
    {
      type: String,
      enum: ["museologico", "arquivistico", "bibliografico"],
      default: []
    }
  ],
  cpf: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (cpf: string) {
        return validarCPF(cpf)
      },
      message: "CPF inválido"
    },
    set: (cpf: string) => cpf.replace(/\D/g, "")
  }
})

function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, "")

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  let soma = 0,
    resto
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf[9])) return false

  soma = 0
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === parseInt(cpf[10])
}

UsuarioSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.ativo
    delete ret.senha
    delete ret.admin
    return ret
  }
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
