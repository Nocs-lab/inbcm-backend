import { Request, Response } from "express";
import { AnoDeclaracao } from "../models/AnoDeclaracao";

class AnoDeclaracaoController {

  /**
   * Cria um novo registro de ano de declaração.
   *
   * @param {number} req.body.ano - O ano da declaração a ser criado.
   * @param {Date} req.body.dataInicioSubmissao - Data de início para submissões das declarações.
   * @param {Date} req.body.dataFimSubmissao - Data de término para submissões das declarações.
   * @param {Date} req.body.dataInicioRetificacao - Data de início para retificações das declarações.
   * @param {Date} req.body.dataFimRetificacao - Data de término para retificações das declarações.
   * @param {number} req.body.metaDeclaracoesEnviadas - Meta de declarações enviadas para o ano especificado.
   * @param {Response} res - Resposta a ser retornada ao cliente.
   *
   * @returns {Promise<Response>} - Resposta contendo o registro criado ou mensagem de erro.
   *
   * @throws {400} - Se o ano já existir.
   * @throws {500} - Em caso de erro interno ao criar o ano de declaração.
   */
  public async criarAnoDeclaracao(req: Request, res: Response): Promise<Response> {
    try {
      const {
        ano,
        dataInicioSubmissao,
        dataFimSubmissao,
        dataInicioRetificacao,
        dataFimRetificacao,
        metaDeclaracoesEnviadas,
      } = req.body;

      // Convertendo as strings para objetos Date, se necessário
      const dataInicioSubmissaoDate = new Date(dataInicioSubmissao);
      const dataFimSubmissaoDate = new Date(dataFimSubmissao);
      const dataInicioRetificacaoDate = new Date(dataInicioRetificacao);
      const dataFimRetificacaoDate = new Date(dataFimRetificacao);

      const anoExistente = await AnoDeclaracao.findOne({ ano });
      if (anoExistente) {
        return res.status(400).json({ message: `Já existe um ano de declaração para o ano ${ano}.` });
      }

      const anoDeclaracao = new AnoDeclaracao({
        ano,
        dataInicioSubmissao: dataInicioSubmissaoDate,
        dataFimSubmissao: dataFimSubmissaoDate,
        dataInicioRetificacao: dataInicioRetificacaoDate,
        dataFimRetificacao: dataFimRetificacaoDate,
        metaDeclaracoesEnviadas,
      });

      await anoDeclaracao.save();
      return res.status(201).json(anoDeclaracao);
    } catch (error) {
      console.error("Erro ao criar o ano de declaração:", error);
      return res.status(500).json({ message: "Erro ao criar o ano de declaração" });
    }
  }

  /**
   * Retorna uma lista de anos de declaração.
   *
   * @param {number} [req.query.quantidadeAnoDeclaracao] - Quantidade de anos a serem retornados (opcional).
   * @param {Response} res - Resposta contendo a lista de anos de declaração.
   *
   * @returns {Promise<Response>} - Lista de anos de declaração ou mensagem de erro.
   *
   * @throws {500} - Em caso de erro interno ao buscar os anos.
   */
  public async getAnoDeclaracao(req: Request, res: Response): Promise<Response> {
    try {
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

  /**
   * Busca um ano de declaração pelo ID.
   *
   * @param {string} req.params.id - ID do ano de declaração a ser buscado.
   * @param {Response} res - Resposta contendo o ano de declaração encontrado ou mensagem de erro.
   *
   * @returns {Promise<Response>} - Ano de declaração encontrado ou mensagem de erro.
   *
   * @throws {404} - Se o ano de declaração não for encontrado.
   * @throws {500} - Em caso de erro interno ao buscar o ano.
   */
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

  /**
   * Atualiza um registro de ano de declaração.
   *
   * @param {string} req.params.id - ID do ano de declaração a ser atualizado.
   * @param {Date} req.body.dataInicioSubmissao - Nova data de início para submissões.
   * @param {Date} req.body.dataFimSubmissao - Nova data de término para submissões.
   * @param {Date} req.body.dataInicioRetificacao - Nova data de início para retificações.
   * @param {Date} req.body.dataFimRetificacao - Nova data de término para retificações.
   * @param {number} req.body.metaDeclaracoesEnviadas - Nova meta de declarações enviadas.
   * @param {Response} res - Resposta contendo o registro atualizado ou mensagem de erro.
   *
   * @returns {Promise<Response>} - Registro atualizado ou mensagem de erro.
   *
   * @throws {404} - Se o ano de declaração não for encontrado.
   * @throws {500} - Em caso de erro interno ao atualizar o ano.
   */
  public async updateAnoDeclaracao(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const {
        dataInicioSubmissao,
        dataFimSubmissao,
        dataInicioRetificacao,
        dataFimRetificacao,
        metaDeclaracoesEnviadas,
      } = req.body;

      // Convertendo as strings para objetos Date, se necessário
      const dataInicioSubmissaoDate = new Date(dataInicioSubmissao);
      const dataFimSubmissaoDate = new Date(dataFimSubmissao);
      const dataInicioRetificacaoDate = new Date(dataInicioRetificacao);
      const dataFimRetificacaoDate = new Date(dataFimRetificacao);

      const updatedAnoDeclaracao = await AnoDeclaracao.findByIdAndUpdate(
        id,
        { dataInicioSubmissao: dataInicioSubmissaoDate, dataFimSubmissao: dataFimSubmissaoDate, dataInicioRetificacao: dataInicioRetificacaoDate, dataFimRetificacao: dataFimRetificacaoDate, metaDeclaracoesEnviadas },
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

  /**
   * Exclui um ano de declaração pelo ID.
   *
   * @param {string} req.params.id - ID do ano de declaração a ser excluído.
   * @param {Response} res - Resposta confirmando a exclusão ou mensagem de erro.
   *
   * @returns {Promise<Response>} - Confirmação de exclusão ou mensagem de erro.
   *
   * @throws {404} - Se o ano de declaração não for encontrado.
   * @throws {500} - Em caso de erro interno ao excluir o ano.
   */
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
