const UploadService = require('../service/UploudService');
const arquivisticoModel = require('../models/Arquivistico.js');

const uploadService = new UploadService();

class UploadController {
  async uploudArquivisticoModel(req, res) {
    try {
      // Adicionando log para verificar se o arquivo está sendo corretamente acessado
      console.log('Arquivo recebido:', req.file);

      // Chamando o serviço UploadService para processar e salvar os dados
      console.log('Chamando serviço UploadService para processar dados...');
      const result = await uploadService.processaESalvaDados(req.file, arquivisticoModel);
      
      // Retornando o resultado da operação
      return res.status(200).json(result);
    } catch (error) {
      // Capturando e logando erros ocorridos durante o processamento dos dados
      console.error('Erro durante o processamento dos dados:', error);
      return res.status(500).json({ success: false, message: 'Erro ao processar e salvar os dados.' });
    }
  }
}

module.exports = UploadController;
