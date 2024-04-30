import type { Request, Response } from "express";
import UploadService from "../queue/Producer";
import crypto from "crypto";
import DeclaracaoService from "../service/declaracao/DeclaracaoService";



const uploadService = new UploadService();
const declaracaoService = new DeclaracaoService();

class BibliograficoController {
  async uploadBibliograficoModel(req: Request, res: Response) {
    try {
      const file = req.file!;
      const tipoArquivo = "bibliografico"; // Definir o tipo de arquivo como 'bibliografico'
      // Chama a função de upload com o arquivo e o tipo de arquivo
      await uploadService.sendToQueue(file, tipoArquivo);

     // Verifica se há alertas na requisição e envia junto com a resposta
     if (req.alerts && req.alerts.length > 0) {
      return res.status(203).json({ message: "Declaração recebida com sucesso para análise.", alerts: req.alerts });
    }

    return res.status(201).json({ message: "Declaração recebida com sucesso para análise." });
    } catch (error) {
      console.error("Erro ao enviar arquivo bibliográfico para a fila:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Erro ao enviar arquivo bibliográfico para a fila.",
        });
    }
  }


  async atualizarBibliografico(req, res) {
    try {
      const file = req.file!;
      const { anoDeclaracao } = req.params;
      const hashArquivo = crypto.createHash('sha256').update(file.path).digest('hex');
      const dadosBibliografico = {
        nome: "Bibliografico",
        status: "em processamento",
        dataCriacao: new Date(),
        situacao: "Normal",
        hashArquivo: hashArquivo,
      };
      // Chamar o método através da instância do serviço
      const declaracaoAtualizada = await declaracaoService.atualizarBibliografico(anoDeclaracao, dadosBibliografico);
      res.status(200).json(declaracaoAtualizada);
    } catch (error) {
      console.error("Erro ao atualizar dados bibliográficos:", error);
      res.status(500).json({ message: "Erro ao atualizar dados bibliográficos." });
    }
  }


}

// Exporta a classe BibliograficoController como exportação padrão
export default BibliograficoController;
