"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Arquivistico = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const BemCultural_1 = __importDefault(require("./BemCultural"));
// Modelo específico para documentos arquivísticos
const ArquivisticoSchema = new mongoose_1.default.Schema({
    codigoReferencia: { type: String, alias: "codigoreferencia" },
    data: { type: String },
    nivelDescricao: { type: Number, enum: [0, 1], alias: "niveldescricao" },
    dimensaoSuporte: { type: String, alias: "dimensaosuporte" },
    nomeProdutor: { type: String, alias: "nomeprodutor" },
    historiaAdministrativaBiografia: { type: String, alias: "historiaadministrativabiografia" },
    historiaArquivistica: { type: String, alias: "historiaarquivistica" },
    procedencia: { type: String },
    ambitoConteudo: { type: String, alias: "ambitoconteudo" },
    sistemaArranjo: { type: String, alias: "sistemarranjo" },
    existenciaLocalizacaoOriginais: { type: String, alias: "existencialocalizacao_originais" },
    notasConservacao: { type: String, alias: "notassobreconservacao" },
    pontosAcessoIndexacaoAssuntos: { type: String, alias: "pontosacessoindexacaoassuntos" }
});
// Use discriminadores para distinguir os modelos
exports.Arquivistico = BemCultural_1.default.discriminator("Arquivistico", ArquivisticoSchema);
