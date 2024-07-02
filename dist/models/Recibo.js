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
exports.ReciboModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Subesquema para arquivos inseridos
const ArquivoInseridoSchema = new mongoose_1.Schema({
    tipo: {
        type: String,
        required: true
    },
    nome: {
        type: String,
        required: true
    },
    caminho: {
        type: String,
        required: true
    },
    hashArquivo: {
        type: String,
        required: true
    }
});
const ReciboSchema = new mongoose_1.Schema({
    dataHoraEnvio: {
        type: Date,
        required: true,
        default: Date.now // Definindo o valor padrão como a data/hora atual
    },
    numeroIdentificacao: {
        type: String,
        required: true,
        unique: true // Garantindo que seja único
    },
    confirmacaoRecebimento: {
        type: Boolean,
        default: false // Iniciando como falso por padrão
    },
    responsavelEnvio: {
        type: String,
        required: true // Obrigatório e sempre uma string
    },
    arquivosInseridos: {
        type: [ArquivoInseridoSchema],
        default: []
    }
});
exports.ReciboModel = mongoose_1.default.model("Recibo", ReciboSchema);
