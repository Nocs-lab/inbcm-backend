import { Request, Response } from "express";
import mongoose from "mongoose";
import { emitirReciboDeclaracao } from "../service/ReciboService";

class ReciboController {
  async gerarRecibo(req: Request, res: Response): Promise<void> {
    try {
      const declaracaoId = mongoose.Types.ObjectId.createFromHexString(req.params.id);
      const anoCalendario = parseInt(req.params.anoCalendario);

      const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=recibo.pdf`,
      });

      emitirReciboDeclaracao(
        declaracaoId,
        anoCalendario,
        chunk => stream.write(chunk),
        () => stream.end() // Adiciona um callback vazio para endCallback
      );
    } catch (error) {
      console.error("Erro ao gerar recibo:", error);
      res.status(500).json({ error: "Erro ao gerar recibo." });
    }
  }
}


export default  ReciboController;
