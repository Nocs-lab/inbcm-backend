import multer from 'multer';
import xlsx from 'xlsx';
import path from 'path';
import { BemMuseologico } from '../models/db.js';

const uploadMiddleware = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(process.cwd(), '/src/uploads/'));
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
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
}).single('planilha');

const processarPlanilha = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                erro: true,
                message: "❌Erro ao fazer upload da planilha"
            });
        } else if (err) {
            return res.status(500).json({
                erro: true,
                message: "❌Erro interno do servidor"
            });
        }

        // Se o upload for bem-sucedido, agora lemos o arquivo e convertemos para JSON
        const workbook = xlsx.readFile(req.file.path);
        const sheet_name_list = workbook.SheetNames;
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], 
            {defval: ''},
            {raw: true}
        );

        console.log(data);

        // Agora você tem os dados da planilha em formato JSON em 'data'

        // Vamos enviar os dados para o banco de dados
        try {
            const postPlanilha = await Promise.all(data.map((row) => BemMuseologico.create({
                id: row.id,
                nome: row.nome,
                email: row.email,
                
            })));

            console.log(postPlanilha);

            // Retornar uma resposta ao cliente
            return res.status(200).json({
                success: true,
                message: "✅Upload da planilha realizado com sucesso"
            });
        } catch (error) {
            console.error('❌Erro ao inserir dados no banco de dados:', error);
            return res.status(500).json({
                erro: true,
                message: "❌Erro ao inserir dados no banco de dados"
            });
        }
    });
};

export default processarPlanilha;