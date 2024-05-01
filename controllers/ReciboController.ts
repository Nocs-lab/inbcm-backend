import { Request, Response } from "express";
import { emitirReciboDeclaracao, enviarReciboComoAnexo } from "../service/reciboService/ReciboService";
import mongoose from "mongoose";

class ReciboController {
  async gerarRecibo(req: Request, res: Response): Promise<void> {
    try {
      const declaracaoId = mongoose.Types.ObjectId.createFromHexString(req.params.id);
      const nomeArquivo = await emitirReciboDeclaracao(declaracaoId);

      // Agora, envie o recibo como anexo de resposta
      await enviarReciboComoAnexo(declaracaoId, res);
    } catch (error) {
      console.error("Erro ao gerar recibo:", error);
      res.status(500).json({ error: "Erro ao gerar recibo." });
    }
  }
}

export default ReciboController;
