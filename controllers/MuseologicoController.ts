import UploadService from "../queue/Producer";
import DeclaracaoService from "../service/DeclaracaoService";



const uploadService = new UploadService();
const declaracaoService = new DeclaracaoService();

class MuseologicoController {

  async atualizarMuseologico(req: any, res: any) {
    try {
      const file = req.file!;
      const { anoDeclaracao } = req.params;
      const tipoArquivo = "museologico";


      await uploadService.sendToQueue(file, tipoArquivo, anoDeclaracao);

      const dadosMuseologico = {
        nome: "Museologico",
        status: "em análise",
        
      };
      // Chamar o método através da instância do serviço
      await declaracaoService.atualizarMuseologico(anoDeclaracao, dadosMuseologico);

      if (req.alerts && req.alerts.length > 0) {
        return res.status(203).json({ message: "Declaração recebida com sucesso para análise.", alerts: req.alerts });
      }

      return res.status(201).json({ message: "Declaração recebida com sucesso para análise." });
    } catch (error) {
      console.error("Erro ao enviar dados museológicos:", error);
      res.status(500).json({ message: "Erro ao enviar dados museológicos." });
    }
  }


}

// Exporta a classe MuseologicoController como exportação padrão
export default MuseologicoController;
