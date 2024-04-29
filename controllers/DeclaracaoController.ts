// DeclaracaoController.ts
import { Request, Response } from "express";
import DeclaracaoService from "../service/declaracao/DeclaracaoService";

class DeclaracaoController {
  private declaracaoService: DeclaracaoService;

  constructor() {
    this.declaracaoService = new DeclaracaoService();
    // Adicione a linha acima para inicializar o serviço
  }

  async mostrarDeclaracao(req: Request, res: Response) {
    try {
      // Seu código para mostrar as declarações...
    } catch (error) {
      console.error("Erro ao buscar declarações:", error);
      res.status(500).json({ message: "Erro ao buscar declarações." });
    }
  }

  async criarDeclaracao(req: Request, res: Response) {
    try {
      // Extrair o ano da declaração dos parâmetros da requisição
      const { anoDeclaracao } = req.params;

      // Chamar o serviço para criar a declaração
      const novaDeclaracao = await this.declaracaoService.criarDeclaracao(anoDeclaracao);

      // Enviar a resposta com a nova declaração
      res.status(201).json({ message: "Declaração criada com sucesso.", declaracao: novaDeclaracao });
    } catch (error) {
      console.error("Erro ao criar declaração:", error);
      res.status(500).json({ message: "Erro ao criar declaração." });
    }
  }
}

export default DeclaracaoController;
