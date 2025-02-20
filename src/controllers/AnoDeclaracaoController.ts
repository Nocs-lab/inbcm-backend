import { Request, Response } from "express"
import { AnoDeclaracao } from "../models/AnoDeclaracao"
import logger from "../utils/logger"
import { DataUtils } from "../utils/dataUtils"

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
  public async criarAnoDeclaracao(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const {
        ano,
        dataInicioSubmissao,
        dataFimSubmissao,
        dataInicioRetificacao,
        dataFimRetificacao,
        metaDeclaracoesEnviadas
      } = req.body

      // Usando o helper DataUtils para formatar as datas
      const dataInicioSubmissaoFormatada = DataUtils.gerarDataHoraFormatada(new Date(dataInicioSubmissao))
      const dataFimSubmissaoFormatada = DataUtils.gerarDataHoraFormatada(new Date(dataFimSubmissao))
      const dataInicioRetificacaoFormatada = DataUtils.gerarDataHoraFormatada(new Date(dataInicioRetificacao))
      const dataFimRetificacaoFormatada = DataUtils.gerarDataHoraFormatada(new Date(dataFimRetificacao))

      const anoExistente = await AnoDeclaracao.findOne({ ano })
      if (anoExistente) {
        return res.status(400).json({
          message: `Já existe um ano de declaração para o ano ${ano}.`
        })
      }

      const anoDeclaracao = new AnoDeclaracao({
        ano,
        dataInicioSubmissao: dataInicioSubmissaoFormatada,
        dataFimSubmissao: dataFimSubmissaoFormatada,
        dataInicioRetificacao: dataInicioRetificacaoFormatada,
        dataFimRetificacao: dataFimRetificacaoFormatada,
        metaDeclaracoesEnviadas
      })

      await anoDeclaracao.save()
      return res.status(201).json(anoDeclaracao)
    } catch (error) {
      logger.error("Erro ao criar o ano de declaração:", error)
      return res
        .status(500)
        .json({ message: "Erro ao criar o ano de declaração" })
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
  public async getAnoDeclaracao(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { quantidadeAnoDeclaracao } = req.query
      const query = AnoDeclaracao.find().sort({ ano: -1 })

      if (quantidadeAnoDeclaracao) {
        query.limit(Number(quantidadeAnoDeclaracao))
      }

      const anoDeclaracoes = await query
      return res.status(200).json(anoDeclaracoes)
    } catch (error) {
      logger.error("Erro ao listar os anos de declaração:", error)
      return res
        .status(500)
        .json({ message: "Erro ao listar os anos de declaração" })
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
  public async getAnoDeclaracaoById(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params
      const anoDeclaracao = await AnoDeclaracao.findById(id)
      if (!anoDeclaracao) {
        return res
          .status(404)
          .json({ message: "Ano de declaração não encontrado" })
      }
      return res.status(200).json(anoDeclaracao)
    } catch (error) {
      logger.error("Erro ao buscar o ano de declaração:", error)
      return res
        .status(500)
        .json({ message: "Erro ao buscar o ano de declaração" })
    }
  }

  /**
   * Busca um ano de declaração pelo valor do ano.
   *
   * @param {string} req.params.ano - O valor do ano a ser buscado no banco de dados.
   * @param {Response} res - Resposta contendo o ano de declaração encontrado ou mensagem de erro.
   *
   * @returns {Promise<Response>} - Objeto contendo o ano de declaração encontrado ou mensagem de erro.
   *
   * @throws {404} - Caso nenhum ano de declaração seja encontrado.
   * @throws {500} - Em caso de erro interno ao buscar o ano.
   */
  public async getAnoDeclaracaoByAno(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { ano } = req.params
      if (!ano || isNaN(Number(ano))) {
        return res
          .status(400)
          .json({ message: "Parâmetro 'ano' inválido ou ausente" })
      }

      const anoDeclaracao = await AnoDeclaracao.findOne({ ano }) // Busca pelo campo 'ano'
      if (!anoDeclaracao) {
        return res
          .status(404)
          .json({ message: "Ano de declaração não encontrado" })
      }

      return res.status(200).json(anoDeclaracao)
    } catch (error) {
      logger.error("Erro ao buscar o ano de declaração pelo ano:", error)
      return res
        .status(500)
        .json({ message: "Erro ao buscar o ano de declaração pelo ano" })
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
  public async updateAnoDeclaracao(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params
      const {
        ano,
        dataInicioSubmissao,
        dataFimSubmissao,
        dataInicioRetificacao,
        dataFimRetificacao,
        metaDeclaracoesEnviadas
      } = req.body


      // Validação para não ser possível alterar o ano de um modelo com declaração vinculada
      const anoDeclaracao = await AnoDeclaracao.findById(id);
      if (!anoDeclaracao) {
        return res.status(404).json({ message: "Ano de declaração não encontrado" });
      }

      if (anoDeclaracao.declaracaoVinculada && ano !== anoDeclaracao.ano) {
        return res.status(403).json({ message: "Não é permitido alterar o ano quando há declarações vinculadas." });
      }

      // Convertendo as strings para objetos Date, se necessário
      const dataInicioSubmissaoDate = new Date(dataInicioSubmissao)
      const dataFimSubmissaoDate = new Date(dataFimSubmissao)
      const dataInicioRetificacaoDate = new Date(dataInicioRetificacao)
      const dataFimRetificacaoDate = new Date(dataFimRetificacao)

      const updatedAnoDeclaracao = await AnoDeclaracao.findByIdAndUpdate(
        id,
        { ano,
          dataInicioSubmissao: dataInicioSubmissaoDate,
          dataFimSubmissao: dataFimSubmissaoDate,
          dataInicioRetificacao: dataInicioRetificacaoDate,
          dataFimRetificacao: dataFimRetificacaoDate,
          metaDeclaracoesEnviadas
        },
        { new: true }
      )

      if (!updatedAnoDeclaracao) {
        return res
          .status(404)
          .json({ message: "Ano de declaração não encontrado" })
      }

      return res.status(200).json(updatedAnoDeclaracao)
    } catch (error) {
      logger.error("Erro ao atualizar o ano de declaração:", error)
      return res
        .status(500)
        .json({ message: "Erro ao atualizar o ano de declaração" })
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
  public async deleteAnoDeclaracao(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params
      const anoDeclaracao = await AnoDeclaracao.findByIdAndDelete(id)

      if (!anoDeclaracao) {
        return res
          .status(404)
          .json({ message: "Ano de declaração não encontrado" })
      }
      if (anoDeclaracao.declaracaoVinculada) {
        return res.status(403).json({ message: "Não é possível excluir este modelo, pois há uma declaração vinculada." });
      }

      return res
        .status(200)
        .json({ message: "Ano de declaração excluído com sucesso" })
    } catch (error) {
      logger.error("Erro ao excluir o ano de declaração:", error)
      return res
        .status(500)
        .json({ message: "Erro ao excluir o ano de declaração" })
    }
  }

  /**
   * Obtém os anos de declaração cujo período de submissão está vigente.
   *
   * Um período é considerado vigente se a data atual estiver entre
   * `dataInicioSubmissao` e `dataFimSubmissao`.
   *
   * @param {Request} req - Objeto da requisição (não utilizado neste método).
   * @param {Response} res - Resposta contendo os anos de declaração vigentes ou uma mensagem de erro.
   *
   * @returns {Promise<Response>} - Lista de anos de declaração com períodos vigentes ou uma mensagem de erro.
   *
   * @throws {500} - Em caso de erro interno ao buscar os períodos vigentes.
   */
  public async getPeriodoDeclaracaoVigente(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const dataAtual = new Date()

      const periodoVigente = await AnoDeclaracao.find({
        dataInicioSubmissao: { $lte: dataAtual },
        dataFimSubmissao: { $gte: dataAtual }
      }).sort({ ano: -1 })

      return res.status(200).json(periodoVigente)
    } catch (error) {
      logger.error("Erro ao listar os períodos vigentes:", error)
      return res
        .status(500)
        .json({ message: "Erro ao listar os períodos vigentes" })
    }
  }
}

export default new AnoDeclaracaoController()
