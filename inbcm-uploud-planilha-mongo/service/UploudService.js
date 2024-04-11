const xlsx = require('xlsx');
const amqp = require('amqplib/callback_api');
const mongoose = require('mongoose');
const Fila = require('../models/Fila'); // Importando o modelo Fila

class UploadService {
  async sendToQueue(file) {
    return new Promise((resolve, reject) => {
      amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
          reject(error0);
        }
        connection.createChannel(function(error1, channel) {
          if (error1) {
            reject(error1);
          }
          const queue = 'fileQueue';
          const msg = { name: file.originalname, path: file.path };

          channel.assertQueue(queue, {
            durable: false
          });
          channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));

          console.log(" [x] Sent %s", msg);
          resolve();
        });
        setTimeout(function() {
          connection.close();
        }, 500);
      });
    });
  }

  async saveToMongoDB(file) {
    const newFile = new Fila({ nome: file.originalname, caminho: file.path }); // Usando o modelo Fila
    return newFile.save();
  }

  async processaESalvaDados(file, model) {
    try {
      console.log('Arquivo lido:', file);

      const workbook = xlsx.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      console.log('Inserindo dados no banco de dados...');
      const insertedData = await model.insertMany(data);
      console.log('Dados inseridos:', insertedData);

      // Enviar o arquivo para a fila do RabbitMQ
      await this.sendToQueue(file);

      // Salvar o arquivo no MongoDB
      await this.saveToMongoDB(file);

      return insertedData;
    } catch (error) {
      console.error('Erro durante o processamento dos dados:', error);
      throw new Error('Erro ao processar e salvar os dados.');
    }
  }
}

module.exports = UploadService;