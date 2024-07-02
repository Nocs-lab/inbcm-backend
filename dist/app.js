"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config");
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes/routes"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const msgpack_1 = __importDefault(require("./msgpack"));
const compression_1 = __importDefault(require("compression"));
const config_1 = __importDefault(require("./config"));
const errorHandling = (err, _req, res, _next) => {
    res.status(500).json({
        msg: err.message,
        success: false,
    });
};
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)(config_1.default.JWT_SECRET));
app.use((0, msgpack_1.default)());
app.use((0, compression_1.default)());
app.use("/api", routes_1.default);
app.use(errorHandling);
exports.default = app;
