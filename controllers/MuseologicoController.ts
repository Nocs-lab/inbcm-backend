import type { Request, Response } from "express";
import UploadService from "../queue/Producer";
import DeclaracaoService from "../service/declaracao/DeclaracaoService";
import crypto from "crypto";



const uploadService = new UploadService();
const declaracaoService = new DeclaracaoService();

class MuseologicoController {
  async uploadMuseologicoModel(req: Request, res: Response) {
    try {
      const file = req.file!;
      const tipoArquivo = "museologico"; // Definir o tipo de arquivo como 'museologico'
      // Chama a função de upload com o arquivo e o tipo de arquivo
      await uploadService.sendToQueue(file, tipoArquivo);

      // Verifica se há alertas na requisição e envia junto com a resposta
      if (req.alerts && req.alerts.length > 0) {
        return res.status(203).json({ message: "Declaração recebida com sucesso para análise.", alerts: req.alerts });
      }

      return res.status(201).json({ message: "Declaração recebida com sucesso para análise." });
    } catch (error) {
      console.error("Erro ao enviar arquivo museológico para a fila:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Erro ao enviar arquivo museológico para a fila.",
        });
    }
  }


  async atualizarMuseologico(req, res) {
    try {
      const file = req.file!;
      const { anoDeclaracao } = req.params;
      const hashArquivo = crypto.createHash('sha256').update(file.path).digest('hex');
      const dadosMuseologico = {
        nome: "Museologico",
        status: "em processamento",
        dataCriacao: new Date(),
        situacao: "Normal",
        hashArquivo: hashArquivo,
      };
      // Chamar o método através da instância do serviço
      const declaracaoAtualizada = await declaracaoService.atualizarMuseologico(anoDeclaracao, dadosMuseologico);
      res.status(200).json(declaracaoAtualizada);
    } catch (error) {
      console.error("Erro ao atualizar dados museológicos:", error);
      res.status(500).json({ message: "Erro ao atualizar dados museológicos." });
    }
  }


}

// Exporta a classe MuseologicoController como exportação padrão
export default MuseologicoController;
