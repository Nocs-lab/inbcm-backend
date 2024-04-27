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
        console.log("Mensagem recebida:", msg?.content.toString());

        try {
          const fileData = JSON.parse(msg?.content.toString()!);
          const filePath = fileData.path;
          const tipoArquivo = fileData.tipoArquivo;
          const fileName = fileData.name;

          // Use o hash do caminho do arquivo para buscar a declaração correspondente no banco de dados
          const hashArquivo = fileData.hashArquivo;
          const declaracao = await Declaracoes.findOne({ hashArquivo, tipoArquivo });

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

          // Verificar campos obrigatórios e emitir alertas se houver campos faltantes
          const camposObrigatorios = {
            arquivistico: ["codigoReferencia", "data"],
            bibliografico: ["numeroRegistro", "situacao"],
            museologico: ["numeroRegistro", "denominacao"]
          };

          const alerts = [];
          camposObrigatorios[tipoArquivo].forEach(campo => {
            if (!data.some(item => item.hasOwnProperty(campo))) {
              alerts.push(`O campo '${campo}' é obrigatório, mas há itens na declaração em que este dado não foi informado. Se desejar, você pode preencher e reenviar sua declaração.`);
            }
          });

          // Emitir alertas se houver campos obrigatórios não preenchidos
          if (alerts.length > 0) {
            console.log("Alertas:", alerts);
            // Você pode enviar os alertas para algum serviço de notificação aqui
          }

          // Inserir os dados na coleção correta independentemente das pendências
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

          // Atualizar o status da declaração com base nas pendências
          if (declaracao) {
            declaracao.status = alerts.length > 0 ? "com pendências" : "em análise";
            await declaracao.save();
          }
        } catch (error) {
          console.error("Erro durante o processamento da mensagem:", error);

          // Se houver um erro, atualizar o status da declaração para 'com pendências'
          const filePath = "";
          const declaracao = await Declaracoes.findOne({ caminho: filePath, tipoArquivo });
          if (declaracao) {
            declaracao.status = "cancelada";
            await declaracao.save();
          }
        }
      },
      {
        noAck: true,
      }
    );
  });
});
