import mongoose, { Schema } from "mongoose";

const DeclaracaoSchema = new Schema({
  nome: String,
  ano: String,
  caminho: String,
  status: {
    type: String,
    enum: [
      "em processamento",
      "em pré-processamento",
      "inserido",
      "com pendências",
      "em análise",
      "retificada",
      "cancelada",
      "tratamento manual",
    ],
    default: "em pré-processamento",
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
     // Se desejar que seja obrigatório
  },
});

const Declaracoes = mongoose.model("Registros_Envio_Declaracoes", DeclaracaoSchema);

export default Declaracoes;
