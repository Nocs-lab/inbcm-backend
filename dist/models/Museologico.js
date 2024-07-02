"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Museologico = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const BemCultural_1 = __importDefault(require("./BemCultural"));
// Modelo específico para documentos museológicos
const MuseologicoSchema = new mongoose_1.default.Schema({
    numeroRegistro: { type: String, alias: "nderegistro" },
    outrosNumeros: { type: String, alias: "outrosnumeros" },
    situacao: { type: String },
    denominacao: { type: String },
    autor: { type: String },
    classificacao: { type: String },
    resumoDescritivo: { type: String, alias: "resumodescritivo" },
    dimensoes: { type: String },
    materialTecnica: { type: String, alias: "materialtecnica" },
    estadoConservacao: { type: String, alias: "estadodeconservacao" },
    localProducao: { type: String, alias: "localdeproducao" },
    dataProducao: { type: String, alias: "datadeproducao" }
});
exports.Museologico = BemCultural_1.default.discriminator("Museologico", MuseologicoSchema);
