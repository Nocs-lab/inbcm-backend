import { Request, Response } from "express";
import DeclaracaoService from "../service/declaracao/DeclaracaoService";
import Declaracoes from "../models/Declaracao";

class DeclaracaoController {
  private declaracaoService: DeclaracaoService;

  constructor() {
    this.declaracaoService = new DeclaracaoService();
  }

  async mostrarDeclaracoes(req: any, res: any) {
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

  async getDeclaracaoAno(req: Request, res: Response) {
    try {
      const { anoDeclaracao } = req.params;
      const declaracao = await Declaracoes.findOne({ anoDeclaracao: anoDeclaracao });

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

  async criarDeclaracao(req: Request, res: Response) {
    try {
      const { anoDeclaracao } = req.body;
      const novaDeclaracao = await this.declaracaoService.criarDeclaracao(anoDeclaracao);
      res.status(201).json({ message: "Declaração criada com sucesso.", declaracao: novaDeclaracao });
    } catch (error) {
      console.error("Erro ao criar declaração:", error);
      res.status(500).json({ message: "Erro ao criar declaração." });
    }
  }
}

export default DeclaracaoController;
