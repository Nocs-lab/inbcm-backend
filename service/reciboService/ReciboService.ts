import fs from "fs";
import PDFDocument from "pdfkit";
import { Recibo } from "../../models/Recibo";

export class ReciboService {
  static async generateReciboPDF(recibo: Recibo, outputPath: string = "recibos/recibo.pdf"): Promise<void> {
    const doc = new PDFDocument();
    const diretorio = 'recibos';

    // Verifica se o diretório existe, se não, cria
    if (!fs.existsSync(diretorio)) {
      fs.mkdirSync(diretorio);
    }

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);


    doc.lineGap(10);


    doc.font('Helvetica');


    doc.image('templates/logo_ibram.png', 50, 45, { width: 200 })
      .font('Helvetica-Bold')
      .fontSize(20)


    doc.moveDown();
    doc
      .font('Helvetica')
      .fontSize(16)
      .text('Recibo de Declaração de Bens Culturais Musealizados', { align: 'center' });


    doc.moveDown(2);
    doc
      .fontSize(12)
      .text(`Número de Identificação: ${recibo.numeroIdentificacao}`);

    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Data e Hora de Envio: ${recibo.dataHoraEnvio}`);

    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Confirmação de Recebimento: ${recibo.confirmacaoRecebimento ? 'Sim' : 'Não'}`);


    doc.end();

    console.log("PDF do recibo gerado:", outputPath);
  }

}
