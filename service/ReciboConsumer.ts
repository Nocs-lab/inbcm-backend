import amqp from 'amqplib/callback_api';
import { ReciboService } from './ReciboService';
import { Recibo } from '../models/Recibo';

export class ReciboConsumer {
  static consumeReciboRequests(queueName: string): void {
    amqp.connect(process.env.QUEUE_URL!, (error0, connection) => {
      if (error0) {
        console.error('Erro ao conectar à fila:', error0);
        return;
      }

      connection.createChannel((error1, channel) => {
        if (error1) {
          console.error('Erro ao criar canal:', error1);
          return;
        }
        

        channel.assertQueue(queueName, {
          durable: false,
        });

        console.log(`Aguardando mensagens na fila: ${queueName}`);

        channel.consume(
          queueName,
          async (msg) => {
            console.log('Mensagem recebida:', msg?.content.toString());

            try {
              const recibo: Recibo = JSON.parse(msg!.content.toString());
              const outputPath = `recibos/${recibo.numeroIdentificacao}.pdf`;

              await ReciboService.generateReciboPDF(recibo, outputPath);

              console.log('Recibo gerado com sucesso:', outputPath);

              channel.ack(msg!);
            } catch (error) {
              console.error('Erro durante o processamento da mensagem:', error);
              channel.reject(msg!, false);
            }
          },
          {
            noAck: false,
          }
        );
      });
    });
  }
}
