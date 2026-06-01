import { Schema, model, Document, Types } from "mongoose"

export interface Exportacao extends Document {
  status: "nao_iniciada" | "em_andamento" | "concluida" | "erro"
  iniciadoEm?: Date
  finalizadoEm?: Date
  erro?: string
  usuario?: Types.ObjectId
  ano?: Types.ObjectId
  numeroExportados?: number
  totalExportacoesConcluidas?: number
  colecoesCriadas: boolean
  idSessao?: string
  colecoes?: {
    museologico: string
    bibliografico: string
    arquivistico: string
  }
  sessoes?: Record<
    string,
    { id: string; status: "em_andamento" | "concluida" | "erro" }
  >
  mapeamento?: {
    museologico: Record<string, string>
    bibliografico: Record<string, string>
    arquivistico: Record<string, string>
  }
}

const ExportacaoSchema = new Schema<Exportacao>({
  status: {
    type: String,
    enum: ["nao_iniciada", "em_andamento", "concluida", "erro"],
    required: true
  },
  iniciadoEm: { type: Date },
  finalizadoEm: { type: Date },
  erro: { type: String },
  numeroExportados: { type: Number },
  totalExportacoesConcluidas: { type: Number, default: 0 },
  colecoesCriadas: { type: Boolean, default: false },
  colecoes: {
    type: {
      museologico: { type: String, required: true },
      bibliografico: { type: String, required: true },
      arquivistico: { type: String, required: true }
    }
  },
  idSessao: { type: String },
  sessoes: {
    type: Schema.Types.Mixed
  },
  mapeamento: {
    type: Schema.Types.Mixed
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "usuarios",
    required: true
  },
  ano: {
    type: Schema.Types.ObjectId,
    ref: "anos",
    required: true
  }
})

const ExportacaoModel = model<Exportacao>("Exportacoes", ExportacaoSchema)

export default ExportacaoModel
