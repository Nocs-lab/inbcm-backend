import { Request, Response } from "express";
import DeclaracaoService from "../service/declaracao/DeclaracaoService";
import Declaracoes from "../models/Declaracao";

class DeclaracaoController {
  private declaracaoService: DeclaracaoService;

  constructor() {
    this.declaracaoService = new DeclaracaoService();
  }

  async mostrarDeclaracoes(req, res) {
    try {
      // Busca todas as declarações no banco de dados, selecionando os campos desejados
      const declaracoes = await Declaracoes.find(
        {},
        {
          responsavelEnvio: 1,
          anoDeclaracao: 1,
          recibo: 1,
          hashDeclaracao: 1,
          dataCriacao: 1, // Incluir o campo tipoArquivo
          status: 1,
          _id: 0, // Excluir o _id do resultado
          arquivistico: 1,
          bibliografico: 1,
          museologico: 1,
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
