const xlsx = require('xlsx');

class UploadService {

    async processaESalvaDados(file, model) {
      try {
       
        const workbook = xlsx.readFile(file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
  
        
        const insertedData = await model.insertMany(data);
        return insertedData;
      } catch (error) {
        throw new Error('Erro ao processar e salvar os dados.');
      }
    }
  }
  
  module.exports = UploadService;
  