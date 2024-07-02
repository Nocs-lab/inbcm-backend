"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const argon2_1 = __importDefault(require("@node-rs/argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Usuario_1 = require("../models/Usuario");
const config_1 = __importDefault(require("../config"));
class AuthService {
    async login({ email, password, admin }) {
        const user = await Usuario_1.Usuario.findOne({ email, admin });
        if (!user) {
            throw new Error("Usuário não encontrado");
        }
        else if (!(await argon2_1.default.verify(user.senha, password))) {
            throw new Error("Senha incorreta");
        }
        const token = jsonwebtoken_1.default.sign({ sub: user.id, admin: user.admin ? true : undefined }, config_1.default.JWT_SECRET, { expiresIn: "1h" });
        const { id: refreshToken } = await Usuario_1.RefreshToken.create({ user, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
        return {
            token,
            refreshToken,
            user
        };
    }
    async refreshToken({ refreshToken }) {
        const refreshTokenObj = await Usuario_1.RefreshToken.findById(refreshToken);
        if (!refreshTokenObj) {
            throw new Error("RefreshToken inválido");
        }
        else if (refreshTokenObj.expiresAt.getTime() < Date.now()) {
            throw new Error("RefreshToken expirado");
        }
        const user = (await Usuario_1.Usuario.findById(refreshTokenObj.user));
        const newToken = jsonwebtoken_1.default.sign({ sub: user.id, admin: user.admin ? true : undefined }, config_1.default.JWT_SECRET, { expiresIn: "1h" });
        return {
            token: newToken
        };
    }
}
exports.default = AuthService;
