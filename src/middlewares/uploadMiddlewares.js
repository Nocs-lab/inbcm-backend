// Incluir as bibliotecas
// Upload de arquivos
import multer from 'multer';
import path from 'path';

// Realizar upload de arquivos
const uploadMiddleware = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(process.cwd(), '/src/uploads/'))
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname)
        }
    }),
    fileFilter: (req, file, cb) => {
        const extensoesPlanilha = ['.xlsx', '.xls', '.csv'];
        const extensaoValida = extensoesPlanilha.includes(path.extname(file.originalname).toLowerCase());
        
        if (extensaoValida) {
            return cb(null, true);
        }
        
        return cb(null, false);
    }
});

export default uploadMiddleware;
