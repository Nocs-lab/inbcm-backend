import type { Request, Response } from "express";
import UploadService from "../service/DeclaracaoService/UploadService";

const uploadService = new UploadService();

class BibliograficoController {
  async uploadBibliograficoModel(req: Request, res: Response) {
    try {
      const file = req.file!;
      const tipoArquivo = "bibliografico"; // Definir o tipo de arquivo como 'bibliografico'

      // Chama a função de upload com o arquivo e o tipo de arquivo
      await uploadService.sendToQueue(file, tipoArquivo);

      return res
        .status(200)
        .json({
          success: true,
          message: "Arquivo bibliográfico enviado para a fila com sucesso.",
        });
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
}

// Exporta a classe BibliograficoController como exportação padrão
export default BibliograficoController;
