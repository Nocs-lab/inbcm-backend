import amqp from "amqplib/callback_api";
import { Types } from "mongoose";
import { emitirReciboDeclaracao } from "../service/reciboService/ReciboService";

const nomeFilaRecibo = "fila_recibo";

async function consumirFilaRecibo(): Promise<void> {
    amqp.connect("amqp://localhost", function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }
            channel.assertQueue(nomeFilaRecibo, { durable: false });
            console.log("Esperando mensagens na fila de recibo...");

            channel.consume(nomeFilaRecibo, async function (msg) {
                if (msg !== null) {
                    try {
                        const declaracaoIdString = msg.content.toString(); 
                        console.log("Mensagem de recibo recebida para declaração:", declaracaoIdString);

                        
                        const declaracaoId = Types.ObjectId.createFromHexString(declaracaoIdString);

                        await emitirReciboDeclaracao(declaracaoId);
                        channel.ack(msg);
                    } catch (error) {
                        console.error("Erro ao processar mensagem de recibo:", error);
                    }
                }
            });
        });
    });
}

consumirFilaRecibo();
