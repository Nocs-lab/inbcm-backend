import { Request, Response } from "express";
import { AnoDeclaracao } from "../models/AnoDeclaracao";

class AnoDeclaracaoController {

  public async criarAnoDeclaracao(req: Request, res: Response): Promise<Response> {
    try {
      const { ano, dataInicioSubmissao, dataFimSubmissao, dataInicioRetificacao, dataFimRetificacao, metaDeclaracoesEnviadas } = req.body;

      const anoExistente = await AnoDeclaracao.findOne({ ano });
      if (anoExistente) {
        return res.status(400).json({ message: `Já existe um ano de declaração para o ano ${ano}.` });
      }

      const anoDeclaracao = new AnoDeclaracao({
        ano,
        dataInicioSubmissao,
        dataFimSubmissao,
        dataInicioRetificacao,
        dataFimRetificacao,
        metaDeclaracoesEnviadas,
      });

      await anoDeclaracao.save();
      return res.status(201).json(anoDeclaracao);
    } catch (error) {
      console.error("Erro ao criar o ano de declaração:", error);
      return res.status(500).json({ message: "Erro ao criar o ano de declaração" });
    }
  }


  public async getAnoDeclaracao(req: Request, res: Response): Promise<Response> {
    try {
      // Obtém o parâmetro opcional da quantidade de anos para consltar
      const { quantidadeAnoDeclaracao } = req.query;
      const query = AnoDeclaracao.find().sort({ ano: -1 });

      if (quantidadeAnoDeclaracao) {
        query.limit(Number(quantidadeAnoDeclaracao));
      }

      const anoDeclaracoes = await query;
      return res.status(200).json(anoDeclaracoes);
    } catch (error) {
      console.error("Erro ao listar os anos de declaração:", error);
      return res.status(500).json({ message: "Erro ao listar os anos de declaração" });
    }
  }




  public async getAnoDeclaracaoById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const anoDeclaracao = await AnoDeclaracao.findById(id);
      if (!anoDeclaracao) {
        return res.status(404).json({ message: "Ano de declaração não encontrado" });
      }
      return res.status(200).json(anoDeclaracao);
    } catch (error) {
      console.error("Erro ao buscar o ano de declaração:", error);
      return res.status(500).json({ message: "Erro ao buscar o ano de declaração" });
    }
  }

  public async updateAnoDeclaracao(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { dataInicioSubmissao, dataFimSubmissao, dataInicioRetificacao, dataFimRetificacao, metaDeclaracoesEnviadas } = req.body;

      const updatedAnoDeclaracao = await AnoDeclaracao.findByIdAndUpdate(
        id,
        { dataInicioSubmissao, dataFimSubmissao, dataInicioRetificacao, dataFimRetificacao, metaDeclaracoesEnviadas },
        { new: true }
      );

      if (!updatedAnoDeclaracao) {
        return res.status(404).json({ message: "Ano de declaração não encontrado" });
      }

      return res.status(200).json(updatedAnoDeclaracao);
    } catch (error) {
      console.error("Erro ao atualizar o ano de declaração:", error);
      return res.status(500).json({ message: "Erro ao atualizar o ano de declaração" });
    }
  }


  public async deleteAnoDeclaracao(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const anoDeclaracao = await AnoDeclaracao.findByIdAndDelete(id);

      if (!anoDeclaracao) {
        return res.status(404).json({ message: "Ano de declaração não encontrado" });
      }

      return res.status(200).json({ message: "Ano de declaração excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir o ano de declaração:", error);
      return res.status(500).json({ message: "Erro ao excluir o ano de declaração" });
    }
  }
}

export default new AnoDeclaracaoController();
