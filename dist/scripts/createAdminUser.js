"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const argon2_1 = require("@node-rs/argon2");
const Usuario_1 = require("../models/Usuario");
const conn_1 = __importDefault(require("../db/conn"));
const [email, nome, senha] = process.argv.slice(2);
const createAdminUser = async () => {
    await (0, conn_1.default)();
    const adminUser = new Usuario_1.Usuario({
        email,
        senha: await (0, argon2_1.hash)(senha),
        admin: true,
        nome,
        museus: []
    });
    await adminUser.save();
};
createAdminUser().then(() => {
    console.log('Usuário criado com sucesso!');
    process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
