import mongoose, { Schema, Document } from "mongoose"

export interface IProcessamentoJob extends Document {
  declaracaoId: mongoose.Types.ObjectId
  tipo: "upload" | "retificacao"
  status: "pending" | "processing" | "completed" | "failed"
  tentativas: number
  maxTentativas: number
  erros: string[]
  criadoEm: Date
  processadoEm?: Date
  concluidoEm?: Date
}

const ProcessamentoJobSchema = new Schema<IProcessamentoJob>({
  declaracaoId: {
    type: Schema.Types.ObjectId,
    ref: "Declaracoes",
    required: true
  },
  tipo: {
    type: String,
    enum: ["upload", "retificacao"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending"
  },
  tentativas: { type: Number, default: 0 },
  maxTentativas: { type: Number, default: 3 },
  erros: [{ type: String }],
  criadoEm: { type: Date, default: Date.now },
  processadoEm: { type: Date },
  concluidoEm: { type: Date }
})

ProcessamentoJobSchema.index({ status: 1, criadoEm: 1 })
ProcessamentoJobSchema.index({ declaracaoId: 1 })

export const ProcessamentoJob = mongoose.model<IProcessamentoJob>(
  "ProcessamentoJob",
  ProcessamentoJobSchema
)
