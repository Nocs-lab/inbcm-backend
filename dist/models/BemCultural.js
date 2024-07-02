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
const mongoose_1 = __importStar(require("mongoose"));
// Defina o modelo base genérico
const BemCulturalSchema = new mongoose_1.default.Schema({
    titulo: { type: String },
    condicoesReproducao: { type: String, alias: "condicoesreproducao" },
    midiasRelacionadas: { type: [String] }, // Pode ser uma lista de URLs ou referências
    declaracao_ref: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Declaracoes" },
    versao: { type: Number, default: 0 } // Adicionando campo de versão
});
// Crie o modelo BemCultural com o esquema definido
const BemCultural = mongoose_1.default.model("bens", BemCulturalSchema);
// Exporte o modelo base
exports.default = BemCultural;
