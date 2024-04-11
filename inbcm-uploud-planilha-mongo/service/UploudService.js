const xlsx = require('xlsx');

class UploadService {

    async processaESalvaDados(file, model) {
      try {
        // Adicionando log para verificar se o arquivo está sendo corretamente lido
        console.log('Arquivo lido:', file);

        const workbook = xlsx.readFile(file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
  
        // Realizando a inserção dos dados no banco de dados
        console.log('Inserindo dados no banco de dados...');
        const insertedData = await model.insertMany(data);
        console.log('Dados inseridos:', insertedData);
        
        return insertedData;
      } catch (error) {
        // Capturando e logando erros ocorridos durante o processamento dos dados
        console.error('Erro durante o processamento dos dados:', error);
        throw new Error('Erro ao processar e salvar os dados.');
      }
    }
  }
  
  module.exports = UploadService;
