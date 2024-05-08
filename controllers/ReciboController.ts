import { Request, Response } from "express";
import mongoose from "mongoose";
import { emitirReciboDeclaracao } from "../service/ReciboService";

class ReciboController {
  async gerarRecibo(req: Request, res: Response): Promise<void> {
    try {
      const declaracaoId = mongoose.Types.ObjectId.createFromHexString(req.params.id);

      const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=recibo.pdf`,
      });

      emitirReciboDeclaracao(
        declaracaoId,
        chunk => stream.write(chunk),
        () => stream.end()
      );
    } catch (error) {
      console.error("Erro ao gerar recibo:", error);
      res.status(500).json({ error: "Erro ao gerar recibo." });
    }
  }
}
export default  ReciboController;
