const amqp = require('amqplib/callback_api');
const Declaracoes = require('../models/Declaracao'); // Importe o modelo Declaracoes


class UploadService {
    async sendToQueue(file, tipoArquivo) {
        return new Promise(async (resolve, reject) => {
            try {
                // Crie uma nova entrada no banco de dados Declaracoes
                const declaracao = new Declaracoes({
                    nome: file.originalname,
                    caminho: file.path,
                    // dataEnvio será definida automaticamente como a data atual
                    // status será definido automaticamente como 'em processamento'
                });
                
                // Salve a entrada no banco de dados
                await declaracao.save();

                // Conecte-se à fila
                amqp.connect('amqp://localhost', function(error0, connection) {
                    if (error0) {
                        reject(error0);
                    }

                    connection.createChannel(function(error1, channel) {
                        if (error1) {
                            reject(error1);
                        }

                        const queue = 'fila_INBCM';
                        const msg = {
                            name: file.originalname,
                            path: file.path,
                            tipoArquivo // Incluir o tipo de arquivo na mensagem
                        };

                        // Assegure-se de que a fila está declarada
                        channel.assertQueue(queue, {
                            durable: false
                        });

                        // Enviar a mensagem para a fila
                        channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));

                        console.log(` [x] Mensagem enviada para a fila: ${JSON.stringify(msg)}`);
                        resolve();
                    });

                    // Feche a conexão após um curto período de tempo
                    setTimeout(function() {
                        connection.close();
                    }, 500);
                });
            } catch (error) {
                console.error('Erro ao criar declaração:', error);
                reject(error);
            }
        });
    }
}

module.exports = UploadService;
