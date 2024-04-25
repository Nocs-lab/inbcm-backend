import { Request, Response } from 'express';
import { ReciboProducer } from '../service/ReciboProducer';
import { Recibo, ReciboModel } from '../models/Recibo';
import { format } from 'date-fns';
export class ReciboController {
  static async gerarRecibo(req: Request, res: Response): Promise<void> {
    try {
      // Gerar um número de identificação único aleatório
      const numeroIdentificacao = Math.floor(Math.random() * 1000000).toString();
      
      // Obter a data e hora atuais
      const dataAtual = new Date();
      const dataHoraEnvio = format(dataAtual, 'dd/MM/yyyy');
      // Verificar se o PDF foi solicitado na requisição
      const reciboSolicitado = req.body.pdfSolicitado === true;

      // Definir o valor de confirmacaoRecebimento com base na solicitação de PDF
      const confirmacaoRecebimento = reciboSolicitado ? 'sim' : 'não';

      const recibo: Recibo = {
        numeroIdentificacao,
        dataHoraEnvio,
        confirmacaoRecebimento,
      };

      await ReciboProducer.sendReciboToQueue(recibo);

      res.status(200).json({ success: true, message: 'Recibo gerado com sucesso.' });
    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
      res.status(500).json({ success: false, message: 'Erro ao gerar recibo.' });
    }
  }
}
