"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const dotenv_expand_1 = require("dotenv-expand");
const zod_1 = require("zod");
dotenv_1.default.config();
const parsedEnv = {};
const parsed = {
    NODE_ENV: process.env.NODE_ENV ?? "DEVELOPMENT",
    DB_USER: process.env.DB_USER ?? "",
    DB_PASS: process.env.DB_PASS ?? "",
    DB_URL: process.env.DB_URL ?? "",
    JWT_SECRET: process.env.JWT_SECRET ?? "__SeCrEt__",
    ADMIN_SITE_URL: process.env.PRIVATE_SITE_URL ?? "https://localhost:5173",
};
// @ts-ignore
(0, dotenv_expand_1.expand)({ parsed, processEnv: parsedEnv });
const schema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["DEVELOPMENT", "PRODUCTION"]),
    DB_USER: zod_1.z.string().min(1),
    DB_PASS: zod_1.z.string().min(1),
    DB_URL: zod_1.z.string().min(1).url(),
    JWT_SECRET: zod_1.z.string().min(1),
    ADMIN_SITE_URL: zod_1.z.string().min(1).url(),
});
const config = schema.parse(parsedEnv);
exports.default = config;
