import db from '../models/db.js';
import uploadMiddleware from '../middlewares/uploadMiddlewares.js';
import processarPlanilha from '../middlewares/dbMiddlewares.js';
import multer from 'multer';

db.raw('SELECT 1+1 as result').then(() => {
    console.log('Controller e banco conectados');
}).catch((err) => {
    console.error('Erro ao conectar ao banco de dados', err);
});

const getHome = (req, res) => {
    res.send('Rota de getHome');
};

const postUpload = async (req, res) => {
    try {
        // Aqui vamos usar a função de middleware diretamente no roteador
        uploadMiddleware.single('planilha')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    erro: true,
                    message: "Erro ao fazer upload da planilha"
                });
            } else if (err) {
                return res.status(500).json({
                    erro: true,
                    message: "Erro interno do servidor"
                });
            }

            // Se o upload for bem-sucedido, chamamos o middleware processarPlanilha
            try {
                await processarPlanilha(req, res, () => {});
                res.status(200).json({
                    erro: false,
                    message: "Upload realizado com sucesso!"
                });
            } catch (error) {
                console.error('Erro ao processar a planilha e enviar para o banco de dados:', error);
                return res.status(500).json({
                    erro: true,
                    message: "Erro interno do servidor"
                });
            }
        });
    } catch (err) {
        console.error('Erro interno do servidor:', err);
        return res.status(500).json({
            erro: true,
            message: "Erro interno do servidor"
        });
    }
};

export default { 
    getHome,
    postUpload
};
