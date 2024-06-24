import mongoose, { Schema, Document } from "mongoose";
import { Status } from "../enums/Status";
import { TipoEnvio } from "../enums/tipoEnvio";
import {gerarData} from "../utils/dataUtils"

export interface HistoricoVersao {
  nome: string;
  caminho: string;
  dataEnvio: string;
  tipoEnvio: TipoEnvio;
  pendencias: string[];
  quantidadeItens: number;
  versao: number;
}

const HistoricoVersaoSchema = new Schema<HistoricoVersao>({
  nome: String,
  caminho: String,
  dataEnvio: { type: String, default: gerarData },
  tipoEnvio: {
    type: String,
    enum: Object.values(TipoEnvio),
  },
  pendencias: [String],
  quantidadeItens: { type: Number, default: 0 },
  versao: { type: Number, default: 0 },
}, { _id: false });

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
  historicoVersoes: HistoricoVersao[];
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
  historicoVersoes: [HistoricoVersaoSchema]
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
  pendente: boolean;
  versao: number;
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
  pendente: { type: Boolean, default: false },
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.Recebido,
  },
  arquivistico: ArquivoSchema,
  bibliografico: ArquivoSchema,
  museologico: ArquivoSchema,
});

export const Declaracoes = mongoose.model<DeclaracaoModel>("Declaracoes", DeclaracaoSchema);
export default Declaracoes;
