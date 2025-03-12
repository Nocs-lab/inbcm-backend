import mongoose, { Schema, Document } from "mongoose"

export interface AnoDeclaracaoModel extends Document {
  ano: number
  dataInicioSubmissao: Date
  dataFimSubmissao: Date
  dataInicioRetificacao: Date
  dataFimRetificacao: Date
  metaDeclaracoesEnviadas: number
  createdAt?: Date
  updatedAt?: Date
  declaracaoVinculada: boolean
}

const AnoDeclaracaoSchema = new Schema<AnoDeclaracaoModel>(
  {
    ano: {
      type: Number,
      required: true,
      unique: true,
      min: [2000, "O ano deve ter 4 dígitos."],
      max: [2999, "O ano deve ter 4 dígitos."]
    },
    dataInicioSubmissao: { type: Date, required: true },
    dataFimSubmissao: { type: Date, required: true },
    dataInicioRetificacao: { type: Date },
    dataFimRetificacao: { type: Date },
    metaDeclaracoesEnviadas: { type: Number, required: true },
    declaracaoVinculada: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
)

// Criar o índice de unicidade manualmente
AnoDeclaracaoSchema.index({ ano: 1 }, { unique: true })

export const AnoDeclaracao = mongoose.model<AnoDeclaracaoModel>(
  "AnoDeclaracoes",
  AnoDeclaracaoSchema
)
