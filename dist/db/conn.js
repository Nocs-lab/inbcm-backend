"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
async function main() {
    try {
        mongoose_1.default.set("strictQuery", true);
        await mongoose_1.default.connect(config_1.default.DB_URL);
        console.log("Conectado ao MongoDB!");
    }
    catch (error) {
        console.log(`Erro: ${error}`);
    }
}
// Exporte a função `main` como exportação padrão
exports.default = main;
