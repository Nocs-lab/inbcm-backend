import multer from 'multer';
import path from 'path';
import FilaService from './FilaService.js';
import xlsx from 'xlsx';

const filaService = new FilaService();

const uploadPlanilha = multer({
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
    uploadPlanilha(req, res, async (err) => {
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

        const caminhoArquivo = req.file.path;

        // Ler o arquivo .xlsx e converter para JSON
        const workbook = xlsx.readFile(caminhoArquivo);
        const sheet_name_list = workbook.SheetNames;
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
            defval: '',
            raw: true
        });

        // Enviar o JSON obtido para a fila do RabbitMQ
        await filaService.conectar();
        await filaService.enviarMensagem('planilhas', data);
        await filaService.fecharConexao();

        // Retornar uma resposta ao cliente
        return res.status(200).json({
            success: true,
            message: "✅Upload da planilha realizado com sucesso"
        });
    });
};

export default processarPlanilha;
