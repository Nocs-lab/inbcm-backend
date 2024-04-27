import type { Request, Response } from "express";
import UploadService from "../service/declaracaoService/DeclaracaoService";

const uploadService = new UploadService();

class MuseologicoController {
  async uploadMuseologicoModel(req: Request, res: Response) {
    try {
      const file = req.file!;
      const tipoArquivo = "museologico"; // Definir o tipo de arquivo como 'museologico'
      // Chama a função de upload com o arquivo e o tipo de arquivo
      await uploadService.sendToQueue(file, tipoArquivo);

      // Verifica se há alertas na requisição e envia junto com a resposta
      if (req.alerts && req.alerts.length > 0) {
        return res.status(203).json({ message: "Declaração recebida com sucesso.", alerts: req.alerts });
      }

      return res.status(201).json({ message: "Declaração recebida com sucesso." });
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
}

// Exporta a classe MuseologicoController como exportação padrão
export default MuseologicoController;
