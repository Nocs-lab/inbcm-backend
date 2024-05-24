import mongoose, { Schema } from "mongoose";

const DeclaracaoSchema = new Schema({
  museu_id: { type: Schema.Types.ObjectId, ref: 'Museu', required: true },
  anoDeclaracao: String,
  responsavelEnvio: { type: Schema.Types.ObjectId, ref: 'usuarios', required: true },
  hashDeclaracao: String,
  dataCriacao: { type: Date, default: Date.now() },
  retificacao: { type: Boolean, default: false },
  retificacaoRef: { type: Schema.Types.ObjectId, ref: 'Declaracoes' },
  status: {
    type: String,
    enum: [
      "em processamento",
      "processada",
      "com pendências",
      "em análise por técnicos do IBRAM",
      "em análise",
      "finalizada",
    ],
    default: "em análise",
  },

  arquivistico: {
    nome: String,
    caminho: String,
    status: {
      type: String,
      enum: [
        "em processamento",
        "em análise",
        "com pendências",
        "não enviado"
      ],
      default: "não enviado",
    },
    hashArquivo: String,
  },

  bibliografico: {
    nome: String,
    caminho: String,
    status: {
      type: String,
      enum: [
        "em processamento",
        "em análise",
        "com pendências",
        "não enviado"
      ],
      default: "não enviado",
    },
    hashArquivo: String,
  },

  museologico: {
    nome: String,
    caminho: String,
    status: {
      type: String,
      enum: [
        "em processamento",
        "em análise",
        "com pendências",
        "não enviado"
      ],
      default: "não enviado",
    },
    hashArquivo: String,
  },
});

export const Declaracoes = mongoose.model("Declaracoes", DeclaracaoSchema);
