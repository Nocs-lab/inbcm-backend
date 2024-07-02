"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const raw_body_1 = __importDefault(require("raw-body"));
const msgpackr_1 = require("msgpackr");
const msgpack = () => {
    const r = new RegExp("^application/x-msgpack", "i");
    const packr = new msgpackr_1.Packr({ useRecords: false });
    const bodyHandler = (req, next) => (err, body) => {
        if (err) {
            return next(err);
        }
        try {
            req.body = packr.unpack(body);
        }
        catch (err) {
            return next(err);
        }
        req._body = true;
        next();
    };
    return async (req, res, next) => {
        try {
            const _json = res.json;
            res.json = (body) => {
                return res.format({
                    "application/json": () => _json.call(res, body),
                    "application/x-msgpack": () => res.send(packr.pack(body)),
                });
            };
            if (r.test(req.header("Content-Type") ?? "")) {
                return (0, raw_body_1.default)(req, { length: req.header("Content-Length"), limit: "100kb" }, bodyHandler(req, next));
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
exports.default = msgpack;
