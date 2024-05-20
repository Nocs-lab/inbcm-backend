import multer from "multer";
import { RequestHandler } from "express";

// Configuração de multer para lidar com uploads de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    let tipoAcervo = '';
    switch (file.fieldname) {
      case 'museologico':
        tipoAcervo = 'M'; // Museológico
        break;
      case 'bibliografico':
        tipoAcervo = 'B'; // Bibliográfico
        break;
      case 'arquivistico':
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
const uploadMiddleware: RequestHandler = (req, res, next) => {
  multer({ storage }).fields([
    { name: "arquivistico", maxCount: 1 },
    { name: "bibliografico", maxCount: 1 },
    { name: "museologico", maxCount: 1 }
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
export default uploadMiddleware;
