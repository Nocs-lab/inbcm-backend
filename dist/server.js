"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config");
const app_1 = __importDefault(require("./app"));
const conn_1 = __importDefault(require("./db/conn"));
(0, conn_1.default)();
const PORT = parseInt(process.env.PORT || "3000");
app_1.default.listen(PORT, () => console.log(`Servidor funcionando na porta ${PORT}`));
