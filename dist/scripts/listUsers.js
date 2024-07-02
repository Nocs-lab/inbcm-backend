"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const conn_1 = __importDefault(require("../db/conn"));
const listUsers = async () => {
    await (0, conn_1.default)();
    const users = await models_1.Usuario.find();
    console.log(users);
};
listUsers().then(() => {
    console.log('Usuários listados com sucesso!');
    process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
