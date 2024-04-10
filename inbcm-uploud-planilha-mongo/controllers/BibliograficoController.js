
// const UploadService = require('../service/UploudService');
// const uploadService = new UploadService();

// class UploadController {
//   async uploadFile(req, res) {
//     try {
//       // Verifique se o arquivo foi enviado corretamente
//       if (!req.file) {
//         return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
//       }

//       // Processamento do arquivo e inserção dos dados no banco de dados
//       const insertedData = await uploadService.processaESalvaDados(req.file);

//       // Resposta ao cliente
//       return res.status(200).json({ message: 'Dados inseridos com sucesso.', insertedData });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: 'Erro ao processar e salvar os dados.' });
//     }
//   }
// }

// module.exports = UploadController;

const UploadService = require('../service/UploudService');
const bibliograficoModel = require('../models/Bibliografico');

const uploadService = new UploadService();

class UploadController {
  async uploudBibliograficoModel(req, res) {
    try {
      const result = await uploadService.processaESalvaDados(req.file, bibliograficoModel);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Erro ao processar e salvar os dados.' });
    }
  }
}

module.exports = UploadController;

