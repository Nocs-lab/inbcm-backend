"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Declaracoes = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Status_1 = require("../enums/Status");
const dataUtils_1 = require("../utils/dataUtils");
const ArquivoSchema = new mongoose_1.Schema({
    nome: String,
    caminho: String,
    status: {
        type: String,
        enum: Object.values(Status_1.Status),
        default: Status_1.Status.NaoEnviado,
    },
    pendencias: [String],
    quantidadeItens: { type: Number, default: 0 },
    hashArquivo: String,
    dataEnvio: { type: String, default: dataUtils_1.gerarData },
    versao: { type: Number, default: 0 },
}, { _id: false });
const HistoricoDeclaracaoSchema = new mongoose_1.Schema({
    versao: { type: Number, required: true },
    dataAtualizacao: { type: String, required: true },
    arquivistico: ArquivoSchema,
    bibliografico: ArquivoSchema,
    museologico: ArquivoSchema,
}, { _id: false });
const DeclaracaoSchema = new mongoose_1.Schema({
    museu_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Museu', required: true },
    museu_nome: String,
    versao: { type: Number, default: 0 },
    anoDeclaracao: String,
    responsavelEnvio: { type: mongoose_1.Schema.Types.ObjectId, ref: 'usuarios', required: true },
    hashDeclaracao: String,
    dataCriacao: { type: String, default: dataUtils_1.gerarData },
    dataAtualizacao: { type: String, default: dataUtils_1.gerarData },
    retificacao: { type: Boolean, default: false },
    retificacaoRef: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Declaracoes' },
    totalItensDeclarados: { type: Number },
    status: {
        type: String,
        enum: Object.values(Status_1.Status),
        default: Status_1.Status.Recebido,
    },
    arquivistico: ArquivoSchema,
    bibliografico: ArquivoSchema,
    museologico: ArquivoSchema,
    historicoDeclaracoes: { type: [HistoricoDeclaracaoSchema], default: [] }
});
exports.Declaracoes = mongoose_1.default.model("Declaracoes", DeclaracaoSchema);
exports.default = exports.Declaracoes;
