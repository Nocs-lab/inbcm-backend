import amqp from "amqplib/callback_api";
import dotenv from "dotenv";


dotenv.config();

class UploadService {
  async sendToQueue(file: Express.Multer.File, tipoArquivo: string, anoDeclaracao: string) {
    return new Promise(async (resolve, reject) => {
      try {

        // Conecte-se à fila
        amqp.connect(process.env.QUEUE_URL!, function (error0, connection) {
          if (error0) {
            reject(error0);
          }

          connection.createChannel(function (error1, channel) {
            if (error1) {
              reject(error1);
            }

            const queue = "fila_INBCM";
            const msg = {
              name: file.originalname,
              path: file.path,
              ano: anoDeclaracao,
              tipoArquivo,
              //hashArquivo: hashArquivo, // Inclua o hash na mensagem
              // Adicione mais campos conforme necessário
            };
            console.log("fila conectada!");

            // Assegure-se de que a fila está declarada
            channel.assertQueue(queue, {
              durable: false,
            });

            // Enviar a mensagem para a fila
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));

            console.log(
              ` [x] Mensagem enviada para a fila: ${JSON.stringify(msg)}`,
            );
            resolve(undefined);
          });

          // Feche a conexão após um curto período de tempo
          setTimeout(() => {
            connection.close();
          }, 500);
        });
      } catch (error) {
        console.error("Erro ao criar declaração:", error);
        reject(error);
      }
    });
  }
}

export default UploadService;
