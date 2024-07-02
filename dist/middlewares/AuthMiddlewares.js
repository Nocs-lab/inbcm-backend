"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Usuario_1 = require("../models/Usuario");
const argon2_1 = require("@node-rs/argon2");
const config_1 = __importDefault(require("../config"));
const userMiddleware = async (req, res, next) => {
    if (config_1.default.NODE_ENV !== "PRODUCTION") {
        const [email, password] = Buffer.from(req.headers["authorization"]?.split(" ")[1] ?? " : ", "base64").toString().split(":");
        const user = await Usuario_1.Usuario.findOne({ email, admin: false });
        if (user) {
            if (await (0, argon2_1.verify)(user.senha, password)) {
                req.body.user = {
                    ...user,
                    sub: user.id,
                    admin: user.admin
                };
                return next();
            }
            else {
                throw new Error("Senha incorreta");
            }
        }
    }
    const { token } = req.signedCookies;
    if (!token) {
        return res.status(401).send();
    }
    const payload = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
    if (payload.admin) {
        return res.status(404).send();
    }
    req.body.user = payload;
    next();
};
exports.userMiddleware = userMiddleware;
const adminMiddleware = async (req, res, next) => {
    if (config_1.default.NODE_ENV !== "PRODUCTION") {
        const [email, password] = Buffer.from(req.headers["authorization"]?.split(" ")[1] ?? " : ", "base64").toString().split(":");
        const user = await Usuario_1.Usuario.findOne({ email, admin: true });
        if (user) {
            if (await (0, argon2_1.verify)(user.senha, password)) {
                req.body.user = {
                    ...user,
                    sub: user.id,
                    admin: user.admin
                };
                return next();
            }
            else {
                throw new Error("Senha incorreta");
            }
        }
    }
    const { token } = req.signedCookies;
    if (!token) {
        return res.status(401).send();
    }
    const payload = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
    if (!payload.admin) {
        return res.status(404).send();
    }
    req.body.user = payload;
    next();
};
exports.adminMiddleware = adminMiddleware;
