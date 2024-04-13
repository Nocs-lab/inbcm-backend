const UploadService = require('../service/UploadService');
const uploadService = new UploadService();

class ArquivisticoController {
    async uploadArquivisticoModel(req, res) {
        try {
            const file = req.file;
            const tipoArquivo = 'arquivistico'; // Definir o tipo de arquivo como 'arquivistico'

            // Chama a função de upload com o arquivo e o tipo de arquivo
            await uploadService.sendToQueue(file, tipoArquivo);

            return res.status(200).json({ success: true, message: 'Arquivo arquivístico enviado para a fila com sucesso.' });
        } catch (error) {
            console.error('Erro ao enviar arquivo arquivístico para a fila:', error);
            return res.status(500).json({ success: false, message: 'Erro ao enviar arquivo arquivístico para a fila.' });
        }
    }
}

module.exports = ArquivisticoController;
