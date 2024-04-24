import mongoose, { Schema } from "mongoose";

const DeclaracaoSchema = new Schema({
  nome: String,
  caminho: String,
  status: {
    type: String,
    enum: [
      "em processamento",
      "em fila de restituição",
      "inserido",
      "com pendências",
      "em análise",
      "retificada",
      "cancelada",
      "tratamento manual",
    ],
    default: "em processamento",
  },
  responsavelEnvio: String,
  data: String,
  hora: String,
  tipo: {
    type: String,
    enum: ["Normal", "Retificadora"],
    default: "Normal",
  },
  hashArquivo: String,
  tipoArquivo: {
    type: String,
    enum: ["bibliografico", "museologico", "arquivistico"],
    required: true, // Se desejar que seja obrigatório
  },
});

const Declaracoes = mongoose.model("Registros_Envio_Declaracoes", DeclaracaoSchema);

export default Declaracoes;
