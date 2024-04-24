import Declaracoes from "../models/Declaracao";

class DeclaracoesController {
  async getDeclaracoes(req, res) {
    try {
      // Busca todas as declarações no banco de dados, selecionando os campos desejados
      const declaracoes = await Declaracoes.find(
        {},
        {
          responsavelEnvio: 1,
          dia: 1,
          hora: 1,
          tipo: 1,
          tipoArquivo: 1, // Incluir o campo tipoArquivo
          status: 1,
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
