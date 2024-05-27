import { Request, Response } from "express";
import mongoose from "mongoose";
import { gerarPDFRecibo } from "../service/ReciboService";

class ReciboController {
  async gerarRecibo(req: Request, res: Response): Promise<void> {
    try {
      const { idDeclaracao } = req.params;
      if (!mongoose.Types.ObjectId.isValid(idDeclaracao)) {
        res.status(400).json({ error: "ID inválido." });
        return;
      }

      const declaracaoId = new mongoose.Types.ObjectId(idDeclaracao);
      const pdfBuffer = await gerarPDFRecibo(declaracaoId);

      res.setHeader("Content-Disposition", `attachment; filename="recibo.pdf"`);
      res.contentType("application/pdf");
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error("Erro ao gerar o recibo:", error);
      res.status(500).json({ error: "Erro ao gerar o recibo." });
    }
  }
}
export default ReciboController;
