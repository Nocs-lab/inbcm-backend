import amqp from "amqplib/callback_api";
import xlsx from "xlsx";
import Bibliografico from "../models/Bibliografico";
import Museologico from "../models/Museologico";
import Arquivistico from "../models/Arquivistico";
import Declaracoes from "../models/Declaracao";
import path from "path";
import connectDB from "../db/conn";
import dotenv from "dotenv";

dotenv.config();

// Chamar a conexão com o banco de dados
connectDB();

amqp.connect(process.env.QUEUE_URL!, (error0, connection) => {
  if (error0) {
    console.error("Erro ao conectar à fila:", error0);
    return;
  }

  connection.createChannel((error1, channel) => {
    if (error1) {
      console.error("Erro ao criar canal:", error1);
      return;
    }

    const queue = "fila_INBCM";

    // Assegure-se de que a fila está declarada
    channel.assertQueue(queue, {
      durable: false,
    });

    console.log(`Aguardando mensagens na fila: ${queue}`);

    // Consome as mensagens da fila
    channel.consume(
      queue,
      async (msg) => {
        console.log("Mensagem recebida:", msg?.content.toString()); // TODO: Fix thiss

        try {
          const fileData = JSON.parse(msg?.content.toString()!);
          const filePath = fileData.path;
          const tipoArquivo = fileData.tipoArquivo;
          const fileName = fileData.name;

          // Buscar a declaração correspondente no banco de dados
          const declaracao = await Declaracoes.findOne({ caminho: filePath });

          // Atualizar o status da declaração para 'em processamento'
          if (declaracao) {
            declaracao.status = "em processamento";
            await declaracao.save();
          }

          const absoluteFilePath = path.resolve(__dirname, "..", filePath);

          // Processar o arquivo com base no tipo de arquivo
          const workbook = xlsx.readFile(absoluteFilePath);
          const sheetName = workbook.SheetNames[0]; // Use a primeira planilha por padrão
          const sheet = workbook.Sheets[sheetName];
          const data = xlsx.utils.sheet_to_json(sheet);

          // Inserir os dados na coleção correta
          switch (tipoArquivo) {
            case "bibliografico":
              await Bibliografico.insertMany(data);
              console.log("Dados inseridos na coleção Bibliografico:", data);

              // Atualizar o status da declaração para 'inserido'
              if (declaracao) {
                declaracao.status = "inserido";
                await declaracao.save();
              }
              break;

            case "museologico":
              await Museologico.insertMany(data);
              console.log("Dados inseridos nos bens Museologico:", data);

              // Atualizar o status da declaração para 'inserido'
              if (declaracao) {
                declaracao.status = "inserido";
                await declaracao.save();
              }
              break;

            case "arquivistico":
              await Arquivistico.insertMany(data);
              console.log("Dados inseridos nos bens Arquivisticos:", data);

              // Atualizar o status da declaração para 'inserido'
              if (declaracao) {
                declaracao.status = "inserido";
                await declaracao.save();
              }
              break;

            default:
              console.error("Tipo de arquivo desconhecido:", tipoArquivo);
              break;
          }
        } catch (error) {
          console.error("Erro durante o processamento da mensagem:", error);

          // Se houver um erro, atualizar o status da declaração para 'com pendências'
          const filePath = ""; //TODO: Fix this
          const declaracao = await Declaracoes.findOne({ caminho: filePath });
          if (declaracao) {
            declaracao.status = "com pendências";
            await declaracao.save();
          }
        }
      },
      {
        noAck: true,
      },
    );
  });
});
