
import mongoose, { Schema, Document } from "mongoose";
import { Status } from "../enums/Status";
import { TipoEnvio } from "../enums/tipoEnvio";
import { gerarData } from "../utils/dataUtils"



export interface Arquivo {
  nome?: string;
  caminho?: string;
  status: Status;
  pendencias?: string[];
  quantidadeItens: number;
  hashArquivo?: string;
  tipoEnvio?: TipoEnvio;
  dataEnvio: string;
  versao: number;
}

const ArquivoSchema = new Schema<Arquivo>({
  nome: String,
  caminho: String,
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.NaoEnviado,
  },
  pendencias: [String],
  quantidadeItens: { type: Number, default: 0 },
  hashArquivo: String,
  dataEnvio: { type: String, default: gerarData },
  versao: { type: Number, default: 0 },
}, { _id: false });

export interface HistoricoDeclaracao {
  versao: number;
  dataAtualizacao: string;
  arquivistico: Arquivo;
  bibliografico: Arquivo;
  museologico: Arquivo;
}

const HistoricoDeclaracaoSchema = new Schema<HistoricoDeclaracao>({
  versao: { type: Number, required: true },
  dataAtualizacao: { type: String, required: true },
  arquivistico: ArquivoSchema,
  bibliografico: ArquivoSchema,
  museologico: ArquivoSchema,
}, { _id: false });

export interface DeclaracaoModel extends Document {
  museu_id: mongoose.Types.ObjectId;
  museu_nome: string;
  anoDeclaracao: string;
  responsavelEnvio: mongoose.Types.ObjectId;
  hashDeclaracao: string;
  dataCriacao: String;
  dataAtualizacao?: String;
  totalItensDeclarados?: number;
  status: Status;
  arquivistico: Arquivo;
  bibliografico: Arquivo;
  museologico: Arquivo;
  retificacao: boolean;
  retificacaoRef: mongoose.Types.ObjectId;
  versao: number;
  historicoDeclaracoes: HistoricoDeclaracao[];
}

export type ArquivoTypes = 'arquivisticoArquivo' | 'bibliograficoArquivo' | 'museologicoArquivo';

const DeclaracaoSchema = new Schema<DeclaracaoModel>({
  museu_id: { type: Schema.Types.ObjectId, ref: 'Museu', required: true },
  museu_nome: String,
  versao: { type: Number, default: 0 },
  anoDeclaracao: String,
  responsavelEnvio: { type: Schema.Types.ObjectId, ref: 'usuarios', required: true },
  hashDeclaracao: String,
  dataCriacao: { type: String, default: gerarData },
  dataAtualizacao: { type: String, default: gerarData },
  retificacao: { type: Boolean, default: false },
  retificacaoRef: { type: Schema.Types.ObjectId, ref: 'Declaracoes' },
  totalItensDeclarados: { type: Number },
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.Recebido,
  },
  arquivistico: ArquivoSchema,
  bibliografico: ArquivoSchema,
  museologico: ArquivoSchema,
  historicoDeclaracoes: { type: [HistoricoDeclaracaoSchema], default: [] }
});

export const Declaracoes = mongoose.model<DeclaracaoModel>("Declaracoes", DeclaracaoSchema);
export default Declaracoes;
