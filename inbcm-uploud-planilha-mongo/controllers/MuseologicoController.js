const UploadService = require('../service/UploudService');
const muselogicoModel = require('../models/Museologico');

const uploadService = new UploadService();

class UploadController {
  async uploudMuselogicoModel(req, res) {
    try {
      const result = await uploadService.processaESalvaDados(req.file, muselogicoModel);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Erro ao processar e salvar os dados.' });
    }
  }
}

module.exports = UploadController;