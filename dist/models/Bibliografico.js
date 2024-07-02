"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bibliografico = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const BemCultural_1 = __importDefault(require("./BemCultural"));
// Modelo específico para documentos bibliográficos
const BibliograficoSchema = new mongoose_1.default.Schema({
    numeroRegistro: { type: String, alias: "nderegistro" },
    outrosNumeros: { type: String, alias: "outrosnumeros" },
    situacao: { type: String },
    tipo: { type: String },
    identificacaoResponsabilidade: { type: String, alias: "identificacaoresponsabilidade" },
    localProducao: { type: String, alias: "localproducao" },
    editora: { type: String },
    data: { type: String, alias: "datadeproducao" },
    dimensaoFisica: { type: String, alias: "dimensaofisica" },
    materialTecnica: { type: String, alias: "materialtecnica" },
    encadernacao: { type: String },
    resumoDescritivo: { type: String, alias: "resumodescritivo" },
    estadoConservacao: { type: String, alias: "estadoconservacao" },
    assuntoPrincipal: { type: String, alias: "assuntoprincipal" },
    assuntoCronologico: { type: String, alias: "assuntocronologico" },
    assuntoGeografico: { type: String, alias: "assuntogeografico" }
});
// Use discriminadores para distinguir os modelos
exports.Bibliografico = BemCultural_1.default.discriminator("Bibliografico", BibliograficoSchema);
