import mongoose, { Schema } from "mongoose"

export interface IAuditoria extends Document {
    documento: string
    documentoId: string
    acao: "CREATE" | "UPDATE" | "DELETE"
    usuario: string
    data: Date
    valorAnterior?: any
    valorNovo?: any
  }
  
  const AuditoriaSchema = new Schema<IAuditoria>({
    documento: { type: String, required: true },
    documentoId: { type: String, required: true },
    acao: { type: String, enum: ["CREATE", "UPDATE", "DELETE"], required: true },
    usuario: { type: String, required: true },
    data: { type: Date, default: Date.now },
    valorAnterior: { type: Schema.Types.Mixed },
    valorNovo: { type: Schema.Types.Mixed },
  })
  
  export const Auditoria = mongoose.model<IAuditoria>("log_operacoes", AuditoriaSchema)