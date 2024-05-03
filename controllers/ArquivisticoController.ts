import UploadService from "../queue/Producer";
import DeclaracaoService from "../service/DeclaracaoService";


const uploadService = new UploadService();
const declaracaoService = new DeclaracaoService();

class ArquivisticoController {

  async atualizarArquivistico(req: any, res: any) {
    try {


      const file = req.file!;
      const { anoDeclaracao } = req.params;


      const tipoArquivo = "arquivistico"; // Definir o tipo de arquivo como 'arquivistico'

      // Chama a função de upload com o arquivo e o tipo de arquivo
      await uploadService.sendToQueue(file, tipoArquivo);

      const dadosArquivistico = {
        nome: "Arquivistico",
        status: "em análise",
       
      };
      // Chamar o método através da instância do serviço
      await declaracaoService.atualizarArquivistico(anoDeclaracao, dadosArquivistico);

      if (req.alerts && req.alerts.length > 0) {
        return res.status(203).json({ message: "Declaração recebida com sucesso para análise.", alerts: req.alerts });
      }

      return res.status(201).json({ message: "Declaração recebida com sucesso para análise." });
    } catch (error) {
      console.error("Erro ao enviar dados arquivísticos:", error);
      res.status(500).json({ message: "Erro ao enviar dados arquivísticos." });
    }
  }
}

// Exporta a classe ArquivisticoController como exportação padrão
export default ArquivisticoController;
