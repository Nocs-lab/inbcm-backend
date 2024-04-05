// consumer.js

import amqp from 'amqplib/callback_api.js';
import { BemMuseologico } from '../models/db.js';

amqp.connect('amqp://localhost', (error0, connection) => {
    if (error0) {
        throw error0;
    }

    connection.createChannel((error1, channel) => {
        if (error1) {
            throw error1;
        }

        const queue = 'planilhas';

        channel.assertQueue(queue, {
            durable: false
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, async (msg) => {
            console.log(" [x] Received %s", msg.content.toString());

            // Processar os dados JSON recebidos
            const data = JSON.parse(msg.content.toString());

            // Vamos enviar os dados para o banco de dados
            try {
                const postPlanilha = await Promise.all(data.map((row) => BemMuseologico.create({
                    id: row.id,
                    nome: row.nome,
                    email: row.email,
                })));

                console.log(postPlanilha);
            } catch (error) {
                console.error('❌Erro ao inserir dados no banco de dados:', error);
            }
        }, {
            noAck: true
        });
    });
});
