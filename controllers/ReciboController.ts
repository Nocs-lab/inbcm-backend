import { Request, Response } from "express";
import mongoose from "mongoose";
import { gerarPDFRecibo } from "../service/ReciboService";

class ReciboController {
  /**
   * Gera o recibo em formato PDF com base no ID da declaração fornecido na requisição.
   *   @param req.params - Parâmetros da rota:
   *     @param idDeclaracao - ID da declaração para a qual o recibo será gerado.

   */
  async gerarRecibo(req: Request, res: Response) {
    try {
      const { idDeclaracao } = req.params;
      if (!mongoose.Types.ObjectId.isValid(idDeclaracao)) {
        res.status(400).json({ error: "ID inválido." });
        return;
      }

      const declaracaoId = new mongoose.Types.ObjectId(idDeclaracao);
      const pdfHtml = await gerarPDFRecibo(declaracaoId);

      res.setHeader("Content-Type", "text/plain");
      res.send(pdfHtml);
    } catch (error) {
      console.error("Erro ao gerar o recibo:", error);
      res.status(500).json({ error: "Erro ao gerar o recibo." });
    }
  }
}
export default ReciboController;
