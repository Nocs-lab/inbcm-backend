const amqp = require('amqplib/callback_api');

class UploadService {
    async sendToQueue(file, tipoArquivo) {
        return new Promise((resolve, reject) => {
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

                setTimeout(function() {
                    connection.close();
                }, 500);
            });
        });
    }
}

module.exports = UploadService;
