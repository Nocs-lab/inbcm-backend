const amqp = require('amqplib/callback_api');
const xlsx = require('xlsx');
const Bibliografico = require('../models/Bibliografico');
const Museologico = require('../models/Museologico');
const Arquivistico = require('../models/Arquivistico');
const path = require('path');
const connectDB = require('../db/conn');

// Chamar a conexão com o banco de dados
connectDB();

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        console.error('Erro ao conectar à fila:', error0);
        return;
    }

    connection.createChannel(function(error1, channel) {
        if (error1) {
            console.error('Erro ao criar canal:', error1);
            return;
        }

        const queue = 'fila_INBCM';

        // Assegure-se de que a fila está declarada
        channel.assertQueue(queue, {
            durable: false
        });

        console.log(`Aguardando mensagens na fila: ${queue}`);

        // Consome as mensagens da fila
        channel.consume(queue, async function(msg) {
            console.log('Mensagem recebida:', msg.content.toString());
            try {
                const fileData = JSON.parse(msg.content.toString());

                const filePath = fileData.path;
                const tipoArquivo = fileData.tipoArquivo;

                const absoluteFilePath = path.resolve(__dirname, '..', filePath);

                // Processar o arquivo com base no tipo de arquivo
                const workbook = xlsx.readFile(absoluteFilePath);
                const sheetName = workbook.SheetNames[0]; // Use a primeira planilha por padrão
                const sheet = workbook.Sheets[sheetName];
                const data = xlsx.utils.sheet_to_json(sheet);

                // Inserir os dados na coleção correta
                switch (tipoArquivo) {
                    case 'bibliografico':
                        await Bibliografico.insertMany(data);
                        console.log('Dados inseridos na coleção Bibliografico:', data);
                        break;
                    case 'museologico':
                        await Museologico.insertMany(data);
                        console.log('Dados inseridos na coleção Museologico:', data);
                        break;
                    case 'arquivistico':
                        await Arquivistico.insertMany(data);
                        console.log('Dados inseridos na coleção Arquivistico:', data);
                        break;
                    default:
                        console.error('Tipo de arquivo desconhecido:', tipoArquivo);
                        break;
                }
            } catch (error) {
                console.error('Erro durante o processamento da mensagem:', error);
            }
        }, {
            noAck: true
        });
    });
});
