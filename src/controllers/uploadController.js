import processarPlanilha from '../middlewares/uploadMiddlewares.js';

const getHome = (req, res) => {
    res.send('Rota de getHome');
};

const postUpload = async (req, res) => {
    try {
        processarPlanilha(req, res, (err) => {
            if (err) {
                return res.status(500).json({
                    erro: true,
                    message: "Erro interno do servidor"
                });
            }
            // A resposta será enviada pelo middleware após o processamento da planilha
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
