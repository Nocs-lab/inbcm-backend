
import { format } from 'date-fns';
import { Request, Response } from 'express';
import { Recibo } from '../models/Recibo';
import { ReciboProducer } from '../service/ReciboService/ReciboProducer';

class ReciboController {
  async gerarRecibo(req: Request, res: Response): Promise<void> {
    try {
      const declaracaoId = mongoose.Types.ObjectId.createFromHexString(req.params.id);
     
      const caminhoDeclaracao = await emitirReciboDeclaracao(declaracaoId);

      
      const pdfConteudo = await lerConteudoPDF(caminhoDeclaracao);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="recibo.pdf"`);

    
      res.status(200).send(pdfConteudo);
    } catch (error) {
      console.error("Erro ao gerar recibo:", error);
      res.status(500).json({ error: "Erro ao gerar recibo." });
    }
  }
}

export default ReciboController;
