
import amqp from "amqplib/callback_api";

const nomeFilaRecibo = "fila_recibo";

function enviarParaFilaRabbitMQ(declaracaoId: string): void {
  amqp.connect("amqp://localhost", function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      channel.assertQueue(nomeFilaRecibo, { durable: false });
      channel.sendToQueue(nomeFilaRecibo, Buffer.from(declaracaoId));
      console.log("Recibo de declaração enviado para a fila:", declaracaoId);
    });
  });
}

export { enviarParaFilaRabbitMQ };
