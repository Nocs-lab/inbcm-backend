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
        "inserido",
        "com pendências",
        "inexistente"
      ],
      default: "inexistente",
    },
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
  },
});

const Declaracoes = mongoose.model("Registros_Envio_Declaracoes", DeclaracaoSchema);

export default Declaracoes;
