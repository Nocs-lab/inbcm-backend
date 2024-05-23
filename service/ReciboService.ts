import mongoose from "mongoose";
import path from "path";
import PDFDocument from "pdfkit";
import Declaracoes from "../models/Declaracao";
import { ReciboModel } from "../models/Recibo";

async function emitirReciboDeclaracao(declaracaoId: mongoose.Types.ObjectId, dataCallback: (chunk: any) => {}, endCallback: () => {}): Promise<typeof PDFDocument> {
  try {
      const declaracao = await Declaracoes.findById(declaracaoId);
      if (!declaracao) {
        throw new Error(`Declaração não encontrada para o ID especificado: ${declaracaoId}`);
      }

      const doc = new PDFDocument({ bufferPages: true });

      doc.on('data', dataCallback);
      doc.on('end', endCallback);

      const imagePath = path.join(__dirname, "../templates/logo_ibram.png");
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

      doc.fontSize(12).text(`Código identificador de  museu: 21`).moveDown();

      doc.fontSize(12).text("Confirmação de Recebimento: Recebido pelo INBCM").moveDown();

      if ( declaracao.arquivistico && declaracao.arquivistico.status !== 'não enviado') {
        doc.moveDown().fontSize(12).text(`Tipo de arquivo declarado: Arquivístico`);

      }
      if (declaracao.bibliografico && declaracao.bibliografico.status !== 'não enviado') {
        doc.moveDown().fontSize(12).text(`Tipo de arquivo declarado: Bibliográfico`);
      }

      if (declaracao.museologico && declaracao.museologico.status !== "não enviado") {
        doc.moveDown().fontSize(12).text(`Tipo de arquivo declarado: Museológico`);
      }

      doc.end();
      const verificaRecibo = await ReciboModel.findOne({ numeroIdentificacao: declaracao.hashDeclaracao }).populate('arquivosInseridos');

      if (verificaRecibo) {
          // Atualizar o recibo existente com os novos detalhes
          verificaRecibo.dataHoraEnvio = new Date();
          verificaRecibo.responsavelEnvio = declaracao.responsavelEnvio.toString();
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

      return doc;
  } catch (error) {
      console.error("Erro ao emitir recibo de declaração:", error);
      throw error;
    }
}


export { emitirReciboDeclaracao };
