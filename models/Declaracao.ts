import mongoose, { Schema } from "mongoose";

const DeclaracaoSchema = new Schema({
  anoDeclaracao: String,
  responsavelEnvio: String,
  recibo: Boolean,
  hashDeclaracao: String,
  dataCriacao: { type: Date, default: Date.now() },
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

const Declaracoes = mongoose.model("Declaracoes", DeclaracaoSchema);

export default Declaracoes;
