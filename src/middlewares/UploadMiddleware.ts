import multer from "multer";
import { RequestHandler } from "express";

// Crie o middleware de upload para lidar com vários arquivos
const uploadMiddleware: RequestHandler = (req, res, next) => {
  multer({ limits: { fieldSize: 1024 * 1024 * 1024 } }).fields([
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

export default uploadMiddleware;
