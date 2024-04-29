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
      "inserido",
      "com pendências",
      "em análise",
      "cancelada",
      "tratamento manual",
      "finalizada",
    ],
    default: "em pré-processamento",
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
        "em análise",
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
        "em análise",
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
        "em análise",
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
