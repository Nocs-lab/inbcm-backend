import xlsx from 'xlsx';
import db from '../models/db.js';

const processarPlanilha = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            erro: true,
            message: "Nenhuma planilha encontrada no upload"
        });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0]; // Assume que a planilha está na primeira aba
    const worksheet = workbook.Sheets[sheetName];
    const dados = xlsx.utils.sheet_to_json(worksheet);

    console.log("Nomes das colunas extraídas da planilha:", Object.keys(dados[0]));

    try {
        // Remove os asteriscos dos nomes das colunas
        const dadosSemAsteriscos = dados.map((linha) => {
            const linhaSemAsteriscos = {};
            for (const chave in linha) {
                const novaChave = chave.replace('*', '');
                linhaSemAsteriscos[novaChave] = linha[chave];
            }
            return linhaSemAsteriscos;
        });

        // Aqui você pode enviar os dados para o banco de dados
        // Exemplo fictício de como salvar no banco de dados:
        await db('tb_bem_museologico').insert(dadosSemAsteriscos);

        // Se o processo de envio para o banco de dados for bem-sucedido, você pode passar para o próximo middleware
        next();
    } catch (error) {
        console.error('Erro ao processar a planilha e enviar para o banco de dados:', error);
        // Não envie resposta aqui
        // O erro será tratado no controller
        next(error); // Passe o erro para o próximo middleware (controller)
    }
};

export default processarPlanilha;
