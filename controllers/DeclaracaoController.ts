import Declaracoes from "../models/Declaracao";

class DeclaracoesController {
  async getDeclaracoes(req, res) {
    try {
      const declaracoes = await Declaracoes.find({}, {
        responsavelEnvio: 1,
        data: 1,
        hora: 1,
        tipo: 1,
        tipoArquivo: 1,
        status: 1,
        _id: 0,
      }).populate('responsavelEnvio', 'nome email'); // Popula os dados do usuário

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
