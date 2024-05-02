// No arquivo do consumidor da fila (o código que consome a fila)

import amqp from "amqplib/callback_api";
import xlsx from "xlsx";
import Bibliografico from "../../models/Bibliografico";
import Museologico from "../../models/Museologico";
import Arquivistico from "../../models/Arquivistico";
import Declaracoes from "../../models/Declaracao";
import path from "path";
import connectDB from "../../db/conn";
import dotenv from "dotenv";
import DeclaracaoService from "./declaracao/DeclaracaoService"; // Importar o serviço de declaração

dotenv.config();

// Chamar a conexão com o banco de dados
connectDB();

const declaracaoService = new DeclaracaoService(); // Instanciar o serviço de declaração

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
        console.log("Mensagem recebida:", msg?.content.toString());

        try {
          const fileData = JSON.parse(msg?.content.toString()!);
          const filePath = fileData.path;
          const tipoArquivo = fileData.tipoArquivo;
          const fileName = fileData.name;

          // Use o hash do caminho do arquivo para buscar a declaração correspondente no banco de dados
          const hashArquivo = fileData.hashArquivo;

          // Atualizar o status da declaração para 'em processamento'
          await declaracaoService.atualizarStatusDeclaracao(hashArquivo, tipoArquivo, "em processamento");

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
              console.log("Dados inseridos para análise nos bens Bibliografico:", data);
              break;

            case "museologico":
              await Museologico.insertMany(data);
              console.log("Dados inseridos para análise nos bens Museologico:", data);
              break;

            case "arquivistico":
              await Arquivistico.insertMany(data);
              console.log("Dados inseridos para análise Arquivisticos:", data);
              break;

            default:
              console.error("Tipo de arquivo desconhecido:", tipoArquivo);
              break;
          }

          // Atualizar o status da declaração para 'em análise' ou 'com pendências'
          await declaracaoService.atualizarStatusDeclaracao(hashArquivo, tipoArquivo, data.length > 0 ? "em análise" : "com pendências");
        } catch (error) {
          console.error("Erro durante o processamento da mensagem:", error);
        }
      },
      {
        noAck: true,
      }
    );
  });
});
