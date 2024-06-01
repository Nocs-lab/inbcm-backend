import mongoose, { Schema, Document } from "mongoose";

interface Pendencia {
  index?: number;
  field?: string;
}

const PendenciaSchema = new Schema({
  index: Number,
  field: String
}, { _id: false });

interface Arquivo {
  nome?: string;
  caminho?: string;
  status: string;
  pendencias: Pendencia[];
  quantidadeItens: number;
  hashArquivo?: string;
}

const ArquivoSchema = new Schema<Arquivo>({
  nome: String,
  caminho: String,
  status: {
    type: String,
    enum: ["em processamento", "em análise", "com pendências", "não enviado"],
    default: "não enviado",
  },
  pendencias: [PendenciaSchema],
  quantidadeItens: { type: Number, default: 0 },
  hashArquivo: String,
}, { _id: false });

interface DeclaracaoModel extends Document {
  museu_id: mongoose.Types.ObjectId;
  anoDeclaracao: string;
  responsavelEnvio: mongoose.Types.ObjectId;
  hashDeclaracao: string;
  dataCriacao: Date;
  totalItensDeclarados?: number;
  status: string;
  arquivistico: Arquivo;
  bibliografico: Arquivo;
  museologico: Arquivo;
  retificacao: boolean;
  retificacaoRef: mongoose.Types.ObjectId;
  pendente: boolean;
}

const DeclaracaoSchema = new Schema<DeclaracaoModel>({
  museu_id: { type: Schema.Types.ObjectId, ref: 'Museu', required: true },
  anoDeclaracao: String,
  responsavelEnvio: { type: Schema.Types.ObjectId, ref: 'usuarios', required: true },
  hashDeclaracao: String,
  dataCriacao: { type: Date, default: Date.now() },
  retificacao: { type: Boolean, default: false },
  retificacaoRef: { type: Schema.Types.ObjectId, ref: 'Declaracoes' },
  totalItensDeclarados: { type: Number },
  pendente: { type: Boolean, default: false },
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
  arquivistico: ArquivoSchema,
  bibliografico: ArquivoSchema,
  museologico: ArquivoSchema,
});


export const Declaracoes = mongoose.model<DeclaracaoModel>("Declaracoes", DeclaracaoSchema);
export { DeclaracaoModel, Pendencia };
export default Declaracoes;
