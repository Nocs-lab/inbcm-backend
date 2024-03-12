import uploadMiddleware from '../middlewares/uploadMiddlewares.js';
import multer from 'multer';

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

            // Se o upload for bem-sucedido
            return res.status(200).json({
                success: true,
                message: "Upload da planilha realizado com sucesso"
            });
            
        });
    } catch (err) {
        console.error('Erro interno do servidor:', err);
        return res.status(500).json({
            erro: true,
            message: "Erro interno do servidor"
        });
    }
};

// Em controllers/dataController.js


export default { 
    getHome,
    postUpload
};
