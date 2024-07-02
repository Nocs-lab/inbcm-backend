"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
// Configuração de multer para lidar com uploads de arquivos
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        let tipoAcervo = '';
        switch (file.fieldname) {
            case 'museologicoArquivo':
                tipoAcervo = 'M'; // Museológico
                break;
            case 'bibliograficoArquivo':
                tipoAcervo = 'B'; // Bibliográfico
                break;
            case 'arquivisticoArquivo':
                tipoAcervo = 'A'; // Arquivístico
                break;
            default:
                cb(new Error('Tipo de declaração inválido.'), "");
                return;
        }
        const IDENTIFICADORMUSEU = req.params.museu;
        const ANODECLARACAO = req.params.anoDeclaracao;
        const TIPODECLARACAO = file.fieldname;
        const TIPOACERVO = tipoAcervo;
        const date = new Date();
        const DATA = date.toLocaleString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '').replace(',', '_').replace(/:/g, '');
        const filename = `${IDENTIFICADORMUSEU}_${ANODECLARACAO}_${TIPOACERVO}_${TIPODECLARACAO}_${DATA}.xlsx`;
        cb(null, filename);
    },
});
// Crie o middleware de upload para lidar com vários arquivos
const uploadMiddleware = (req, res, next) => {
    (0, multer_1.default)({ storage, limits: { fieldSize: 1024 * 1024 * 1024 } }).fields([
        { name: "arquivisticoArquivo", maxCount: 1 },
        { name: "bibliograficoArquivo", maxCount: 1 },
        { name: "museologicoArquivo", maxCount: 1 }
    ])(req, res, err => {
        if (err) {
            console.log(err);
            return res.status(400).json({ message: "Erro ao fazer upload dos arquivos." });
        }
        // Verificar se os arquivos foram enviados corretamente
        if (!req.files) {
            return res.status(400).json({ message: "Nenhum arquivo enviado." });
        }
        next();
    });
};
// Exporte o middleware de upload
exports.default = uploadMiddleware;
