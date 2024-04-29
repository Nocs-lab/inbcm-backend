import Declaracoes from "../models/Declaracao";
//import UploadService from "../service/declaracaoService/UploadService";

class DeclaracoesController {
  async getDeclaracoes(req, res) {
    try {
      // Busca todas as declarações no banco de dados, selecionando os campos desejados
      const declaracoes = await Declaracoes.find(
        {},
        {
          responsavelEnvio: 1,
          anoDeclaracao: 1,
          recibo: 1,
          dataCriacao: 1,
          museologico: 1,
          bibliografico: 1,
          arquivistico: 1,
          status: 1,
          hashArquivo: 0, // Excluir o hash do resultado
          _id: 0, // Excluir o _id do resultado
        }
      );

      if (declaracoes.length === 0) {
        return res.status(404).json({ message: "Nenhuma declaração foi encontrada no histórico." });
      }

      return res.status(200).json(declaracoes);
    } catch (error) {
      console.error("Erro ao buscar declarações:", error);
      return res.status(500).json({ message: "Erro ao buscar declarações" });
    }
  }
}




export default new DeclaracoesController();
