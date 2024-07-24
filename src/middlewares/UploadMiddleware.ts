import multer, { MulterError } from 'multer';
import { Request, RequestHandler } from 'express';

interface SubmissionRequest extends Request {
  files: {
    arquivistico?: Express.Multer.File[];
    bibliografico?: Express.Multer.File[];
    museologico?: Express.Multer.File[];
  };
}

const upload = multer({ limits: { fieldSize: 1024 * 1024 * 1024 } }).fields([
  { name: 'arquivistico', maxCount: 1 },
  { name: 'bibliografico', maxCount: 1 },
  { name: 'museologico', maxCount: 1 },
]);

const uploadMiddleware: RequestHandler = (req, res, next) => {
  upload(req, res, (err: any) => {
    if (err instanceof MulterError) {
      return res.status(400).json({ message: 'Erro ao fazer submissão do(s) arquivo(s): ' + err.message });
    } else if (err instanceof Error) {
      return res.status(500).json({ message: 'Erro não mapeado ao fazer submissão do(s) arquivo(s): ' + err.message });
    }
    const uploadReq = req as SubmissionRequest;

    if (
      !uploadReq.files.arquivistico &&
      !uploadReq.files.bibliografico &&
      !uploadReq.files.museologico
    ) {
      return res.status(400).json({ message: 'Pelo menos um arquivo deve ser enviado.' });
    }

    next();
  });
};

export default uploadMiddleware;
