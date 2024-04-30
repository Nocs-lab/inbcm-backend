import amqp from 'amqplib/callback_api';
import { Recibo } from '../../models/Recibo';
import { ReciboService } from './ReciboService';

export class ReciboProducer {
  static sendReciboToQueue(recibo: Recibo): void {
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

        const queueName = 'fila_RECIBO';

        channel.assertQueue(queueName, {
          durable: false,
        });

        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(recibo)));
        ReciboService.generateReciboPDF(recibo);
        console.log('Recibo enviado para a fila:', recibo);
      });
    });
  }
}
