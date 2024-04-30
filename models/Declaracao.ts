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
      "solicitada",
      "em processamento",
      "processada",
      "com pendências",
      "em análise",
      "cancelada",
      "tratamento manual",
      "finalizada",
    ],
    default: "cancelada",
  },

  arquivistico: {
    nome: String,
    caminho: String,
    status: {
      type: String,
      enum: [
        "em processamento",
        "inserido",
        "com pendências",
        "inexistente"
      ],
      default: "inexistente",
    },
    dataCriacao: { type: Date},
    hora: String,
    situacao: {
      type: String
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
        "inserido",
        "com pendências",
        "inexistente"
      ],
      default: "inexistente",
    },
    dataCriacao: { type: Date},
    hora: String,
    situacao: {
      type: String
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
        "inserido",
        "com pendências",
        "inexistente"
      ],
      default: "inexistente",
    },
    dataCriacao: { type: Date },
    hora: String,
    situacao: {
      type: String
    },
    hashArquivo: String,
  },
});

const Declaracoes = mongoose.model("Registros_Envio_Declaracoes", DeclaracaoSchema);

export default Declaracoes;
