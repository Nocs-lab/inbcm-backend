const UploadService = require('../service/UploudService');
const arquivisticoModel = require('../models/Arquivistico');

const uploadService = new UploadService();

class UploadController {
  async uploudArquivisticoModel(req, res) {
    try {
      const result = await uploadService.processaESalvaDados(req.file, arquivisticoModel);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Erro ao processar e salvar os dados.' });
    }
  }
}

module.exports = UploadController;