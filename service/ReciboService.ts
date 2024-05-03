import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import PDFDocument from "pdfkit";
import Declaracoes from "../models/Declaracao";
import { ReciboModel } from "../models/Recibo";
import { enviarParaFilaRabbitMQ } from "../queue/ReciboProducer";

const pastaUploadRecibos = path.join(__dirname, "../../upload_recibos");

function lerConteudoPDF(caminhoPDF: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      fs.readFile(caminhoPDF, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  async function emitirReciboDeclaracao(declaracaoId: mongoose.Types.ObjectId): Promise<string> {
    try {
        const declaracao = await Declaracoes.findById(declaracaoId);
        if (!declaracao) {
            throw new Error(`Declaração não encontrada para o ID especificado: ${declaracaoId}`);
        }

        const nomeArquivo = `recibo_${declaracao.hashDeclaracao}.pdf`;
        const caminhoPDF = path.join(pastaUploadRecibos, nomeArquivo);
        const doc = new PDFDocument();

        doc.pipe(fs.createWriteStream(caminhoPDF));
        const imagePath = path.join(__dirname, "../../templates/logo_ibram.png");
        doc.image(imagePath, {
            fit: [150, 150],
            align: "center",
            valign: "center"
        });
        doc.moveDown(10)
        // Cabeçalho
        doc.fontSize(18).text("Recibo de Envio de Declaração de Inventário", { align: "center" }).moveDown(0.5);
        doc.fontSize(14).text("Instituto Brasileiro de Museus (IBRAM)", { align: "center" }).moveDown(1);

        const dataEnvio = new Date().toLocaleString("pt-BR");
        doc.fontSize(12).text(`Data de Envio: ${dataEnvio}`, { underline: true }).moveDown();

        doc.fontSize(12).text(`Número de Identificação: ${declaracao.hashDeclaracao}`).moveDown();

        doc.fontSize(12).text(`Responsável pelo Envio: ${declaracao.responsavelEnvio}`).moveDown();

        doc.fontSize(12).text("Confirmação de Recebimento: Recebido pelo INBCM").moveDown();

        doc.end();

        // Verificar se já existe um recibo com o mesmo número de identificação
        const verificaRecibo = await ReciboModel.findOne({ numeroIdentificacao: declaracao.hashDeclaracao }).populate('arquivosInseridos');

        if (verificaRecibo) {
            // Atualizar o recibo existente com os novos detalhes
            verificaRecibo.dataHoraEnvio = new Date();
            if (typeof declaracao.responsavelEnvio === 'string') {
                verificaRecibo.responsavelEnvio = declaracao.responsavelEnvio;
            } else {
                // Trata o caso em que o valor não é uma string, por exemplo, atribua uma string vazia ou outro valor padrão
                verificaRecibo.responsavelEnvio = '';
            }
            verificaRecibo.confirmacaoRecebimento = false; // Ou deixar como estava
            await verificaRecibo.save();
        } else {
            const recibo = new ReciboModel({
                dataHoraEnvio: new Date(),
                numeroIdentificacao: declaracao.hashDeclaracao,
                responsavelEnvio: declaracao.responsavelEnvio,
                confirmacaoRecebimento: true
            });
            await recibo.save();
        }
        enviarParaFilaRabbitMQ(declaracaoId.toHexString())
        return caminhoPDF;
    } catch (error) {
        console.error("Erro ao emitir recibo de declaração:", error);
        throw error;
    }
}


export { emitirReciboDeclaracao, lerConteudoPDF };

