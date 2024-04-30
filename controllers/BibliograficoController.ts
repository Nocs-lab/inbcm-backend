import type { Request, Response } from "express";
import UploadService from "../queue/Producer";
import crypto from "crypto";
import DeclaracaoService from "../service/declaracao/DeclaracaoService";



const uploadService = new UploadService();
const declaracaoService = new DeclaracaoService();

class BibliograficoController {

  async atualizarBibliografico(req: any, res: any) {
    try {
      const file = req.file!;
      const { anoDeclaracao } = req.params;
      const tipoArquivo = "bibliografico";
      const hashArquivo = crypto.createHash('sha256').update(file.path).digest('hex');

      await uploadService.sendToQueue(file, tipoArquivo, anoDeclaracao, hashArquivo);

      const dadosBibliografico = {
        nome: "Bibliografico",
        status: "inserido",
        dataCriacao: new Date(),
        situacao: "Normal",
        hashArquivo: hashArquivo,
      };
      // Chamar o método através da instância do serviço
      await declaracaoService.atualizarBibliografico(anoDeclaracao, dadosBibliografico);

      if (req.alerts && req.alerts.length > 0) {
        return res.status(203).json({ message: "Declaração recebida com sucesso para análise.", alerts: req.alerts });
      }

      return res.status(201).json({ message: "Declaração recebida com sucesso para análise." });
    } catch (error) {
      console.error("Erro ao enviar dados bibliográficos:", error);
      res.status(500).json({ message: "Erro ao enviar dados bibliográficos." });
    }
  }


}

// Exporta a classe BibliograficoController como exportação padrão
export default BibliograficoController;
