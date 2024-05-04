import { Request, Response } from "express";
import Declaracoes from "../models/Declaracao";
import DeclaracaoService from "../service/DeclaracaoService";

class DeclaracaoController {
  private declaracaoService: DeclaracaoService;

  constructor() {
    this.declaracaoService = new DeclaracaoService();
  }

  async getDeclaracaoAno(req: Request, res: Response) {
    try {
      const { anoDeclaracao } = req.params;
      const declaracao = await Declaracoes.findOne({ anoDeclaracao });

      if (!declaracao) {
        return res.status(404).json({ message: "Declaração não encontrada para o ano especificado." });
      }

      return res.status(200).json(declaracao);
    } catch (error) {
      console.error("Erro ao buscar declaração por ano:", error);
      return res.status(500).json({ message: "Erro ao buscar declaração por ano." });
    }
  }

  async getDeclaracao(req: Request, res: Response) {
    try {
      const declaracoes = await Declaracoes.find();

      if (declaracoes.length === 0) {
        return res.status(404).json({ message: "Nenhuma declaração foi encontrada." });
      }

      return res.status(200).json(declaracoes);
    } catch (error) {
      console.error("Erro ao buscar declarações:", error);
      return res.status(500).json({ message: "Erro ao buscar declarações." });
    }
  }

  async uploadDeclaracao(req: Request, res: Response) {
    try {
      const { anoDeclaracao } = req.body;

      // Verificar se a declaração já existe
      let declaracaoExistente = await this.declaracaoService.verificarDeclaracaoExistente(anoDeclaracao);

      // Se a declaração não existe, retornar uma resposta indicando isso
      if (!declaracaoExistente) {
        return res.status(404).json({ message: "Declaração não encontrada para o ano especificado." });
      }

      // Se a declaração existe, atualizar o status
      await this.declaracaoService.atualizarStatusDeclaracao(declaracaoExistente.hashDeclaracao, 'tipoArquivo', 'novoStatus');
      return res.status(200).json({ message: "Status da declaração atualizado com sucesso." });

    } catch (error) {
      console.error("Erro ao verificar e atualizar declaração:", error);
      return res.status(500).json({ message: "Erro ao verificar e atualizar declaração." });
    }
  }
}

export default DeclaracaoController;
