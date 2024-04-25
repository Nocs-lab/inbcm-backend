import amqp from "amqplib/callback_api";
import dotenv from "dotenv";
import Declaracoes from "../../models/Declaracao";

dotenv.config();

class UploadService {
  async sendToQueue(file: Express.Multer.File, tipoArquivo: string, responsavelEnvio: string, tipo: string) {
    return new Promise(async (resolve, reject) => {
      try {
        // Crie uma nova entrada no banco de dados Declaracoes
        const declaracao = new Declaracoes({
          nome: file.originalname,
          caminho: file.path,
          responsavelEnvio: "Usuario exemplo",
          data: new Date().toLocaleDateString("pt-BR"), // Data do envio no formato brasileiro (dd/mm/yyyy)
          hora: new Date().toLocaleTimeString(), // Hora do envio
          tipo, // Tipo da declaração
          tipoArquivo, // Tipo do arquivo
          status: "em processamento", // status será definido automaticamente como 'em processamento'
          hashArquivo: "", // Você pode gerar um hash aqui se necessário
        });

        // Salve a entrada no banco de dados
        await declaracao.save();

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
              tipoArquivo,
              responsavelEnvio,
              tipo,
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
