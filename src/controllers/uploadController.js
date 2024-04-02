import processarPlanilha from '../services/uploadService.js';
import sequelize from '../models/db.js';

const getTeste = (req, res) => {
    res.send('Rota de getTeste');
};

const getUpload = (req, res) => {
    // Consulta ao banco de dados para obter os registros inseridos
    const sql = 'SELECT * FROM users';
    sequelize.query(sql)
        .then(rows => {
            console.log("VEJA A PLANILHA 👍");
            return res.status(200).json({
                registros: rows
            });
        })
        .catch(err => {
            console.error('❌Erro ao consultar o banco de dados:', err);
            return res.status(500).json({
                erro: true,
                message: "❌Erro interno do servidor"
            });
        });
};


const postUpload = async (req, res) => {
    try {
        processarPlanilha(req, res, (err) => {
            if (err) {
                return res.status(500).json({
                    erro: true,
                    message: "❌Erro interno do servidor"
                });
            }
            // A resposta será enviada pelo middleware após o processamento da planilha
        });
    } catch (err) {
        console.error('Erro interno do servidor:', err);
        return res.status(500).json({
            erro: true,
            message: "❌Erro interno do servidor"
        });
    }
};


export default { 
    getTeste,
    postUpload,
    getUpload
};
