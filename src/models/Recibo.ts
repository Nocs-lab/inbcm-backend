import mongoose, { Schema, Document } from "mongoose"

// Subesquema para arquivos inseridos
const ArquivoInseridoSchema = new Schema({
  tipo: {
    type: String,
    required: true
  },
  nome: {
    type: String,
    required: true
  },
  caminho: {
    type: String,
    required: true
  },
  hashArquivo: {
    type: String,
    required: true
  }
})

export interface Recibo extends Document {
  dataHoraEnvio: Date
  numeroIdentificacao: string
  confirmacaoRecebimento: boolean
  responsavelEnvio: string // Modificado para garantir que seja sempre uma string
  arquivosInseridos: (typeof ArquivoInseridoSchema)[]
}

const ReciboSchema = new Schema({
  dataHoraEnvio: {
    type: Date,
    required: true,
    default: Date.now // Definindo o valor padrão como a data/hora atual
  },
  numeroIdentificacao: {
    type: String,
    required: true,
    unique: true // Garantindo que seja único
  },
  confirmacaoRecebimento: {
    type: Boolean,
    default: false // Iniciando como falso por padrão
  },
  responsavelEnvio: {
    type: String,
    required: true // Obrigatório e sempre uma string
  },
  arquivosInseridos: {
    type: [ArquivoInseridoSchema],
    default: []
  }
})

export const ReciboModel = mongoose.model<Recibo>("Recibo", ReciboSchema)
