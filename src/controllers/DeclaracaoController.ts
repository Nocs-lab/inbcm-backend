import { Request, Response } from "express"
import { Declaracoes, Usuario } from "../models"
import DeclaracaoService from "../service/DeclaracaoService"
import { generateSalt } from "../utils/hashUtils"
import { Museu } from "../models"
import path from "path"
import mongoose from "mongoose"
import { getLatestPathArchive } from "../utils/minioUtil"
import minioClient from "../db/minioClient"
import { DataUtils } from "../utils/dataUtils"
import { Status } from "../enums/Status"
import { Eventos } from "../enums/Eventos"
import logger from "../utils/logger"

export class DeclaracaoController {
  private declaracaoService: DeclaracaoService

  constructor() {
    this.declaracaoService = new DeclaracaoService()
    // Faz o bind do contexto atual para as funções
    this.uploadDeclaracao = this.uploadDeclaracao.bind(this)
    this.getDeclaracaoFiltrada = this.getDeclaracaoFiltrada.bind(this)
    this.getStatusEnum = this.getStatusEnum.bind(this)
    this.atualizarStatusDeclaracao = this.atualizarStatusDeclaracao.bind(this)
    this.getDeclaracoes = this.getDeclaracoes.bind(this)
    this.getDeclaracao = this.getDeclaracao.bind(this)
    this.getDeclaracaoAno = this.getDeclaracaoAno.bind(this)
    this.getItensPorAnoETipo = this.getItensPorAnoETipo.bind(this)
    this.getDashboard = this.getDashboard.bind(this)
    this.excluirDeclaracao = this.excluirDeclaracao.bind(this)
    this.getTimeLine = this.getTimeLine.bind(this)
  }

  async atualizarStatusDeclaracao(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.body

      const declaracao = await Declaracoes.findById(id)
      if (!declaracao) {
        return res.status(404).json({ message: "Declaração não encontrada." })
      }

      if (status === Status.Excluida) {
        const existeDeclaracaoNova = await Declaracoes.findOne({
          museu: declaracao.museu_id,
          anoDeclaracao: declaracao.anoDeclaracao,
          status: Status.Recebida,
          _id: { $ne: id }
        })

        if (existeDeclaracaoNova) {
          return res.status(400).json({
            message:
              "Não é possível restaurar esta declaração porque já existe uma  nova declaração  para o mesmo museu e ano."
          })
        }
      }
      if (status === Status.Recebida && declaracao.status === Status.Excluida) {
        declaracao.timeLine.push({
          nomeEvento: Eventos.DeclaracaoRestaurada,
          dataEvento: DataUtils.getCurrentData(),
          autorEvento: declaracao.responsavelEnvioAnaliseNome
        })
      }

      declaracao.status = status
      await declaracao.save()

      return res.status(200).json({ message: "Status atualizado com sucesso." })
    } catch (error) {
      logger.error("Erro ao atualizar o status da declaração:", error)
      return res.status(500).json({
        message: "Erro ao atualizar o status da declaração.",
        error: error.message
      })
    }
  }

  // Retorna uma declaração com base no ano e museu
  async getDeclaracaoAno(req: Request, res: Response) {
    try {
      const { anoDeclaracao, museu } = req.params
      const declaracao = await Declaracoes.findOne({
        anoDeclaracao,
        museu_id: museu,
        ultimaDeclaracao: true
      })

      if (!declaracao) {
        return res.status(404).json({
          message: "Declaração não encontrada para o ano especificado."
        })
      }

      return res.status(200).json(declaracao)
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erro ao buscar declaração por ano." })
    }
  }

  async getDeclaracao(req: Request, res: Response) {
    try {
      const { id } = req.params
      const isAdmin = req.user?.admin

      const selectFields = isAdmin
        ? ""
        : "-responsavelEnvioAnaliseNome -analistasResponsaveisNome -responsavelEnvioAnalise -analistasResponsaveis"

      const declaracao = await Declaracoes.findById(id)
        .select(selectFields)
        .populate({
          path: "museu_id",
          model: Museu
        })

      if (!declaracao) {
        return res.status(404).json({ message: "Declaração não encontrada." })
      }

      if (declaracao.ultimaDeclaracao === false) {
        return res
          .status(404)
          .json({ message: "Não é possível acessar declaração." })
      }

      return res.status(200).json(declaracao)
    } catch (error) {
      logger.error("Erro ao buscar declaração:", error)
      return res.status(500).json({ message: "Erro ao buscar declaração." })
    }
  }

  // Retorna todas as declarações do usuário logado
  async getDeclaracoes(req: Request, res: Response) {
    try {
      // Realiza a agregação para obter a última declaração de cada museu em cada ano
      const resultado = await Declaracoes.aggregate([
        {
          $match: {
            responsavelEnvio: new mongoose.Types.ObjectId(req.user.id),
            status: { $ne: Status.Excluida },
            ultimaDeclaracao: true
          }
        },
        {
          $sort: { anoDeclaracao: 1, museu_nome: 1, createdAt: -1 } // Ordena por ano, museu e createdAt decrescente
        },
        {
          $group: {
            _id: { museu_id: "$museu_id", anoDeclaracao: "$anoDeclaracao" },
            latestDeclaracao: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: { newRoot: "$latestDeclaracao" }
        }
      ])

      // Popula os documentos de museu referenciados pelo campo museu_id nas declarações agregadas
      const declaracoes = await Museu.populate(resultado, { path: "museu_id" })

      // Retorna o resultado final
      return res.status(200).json(declaracoes)
    } catch (error) {
      logger.error("Erro ao buscar declarações:", error)
      return res.status(500).json({ message: "Erro ao buscar declarações." })
    }
  }

  async getStatusEnum(req: Request, res: Response) {
    const statusEnum = Declaracoes.schema.path("status")
    const status = Object.values(statusEnum)[0]
    return res.status(200).json(status)
  }

  /*
   * Retorna a quantidade de declarações agrupadas por analista, filtradas pelos últimos X anos.
   *
   * @param {Request}
   * @param {Response}
   * @returns {Promise<Response>}
   * @throws {500} - Se ocorrer um erro interno ao processar a requisição.
   *
   */
  async getDashboard(req: Request, res: Response) {
    try {
      const { anos, estados, museu, cidades } = req.query

      return res
        .status(200)
        .json(
          await this.declaracaoService.getDashboardData(
            estados
              ? Array.isArray(estados)
                ? estados.map(String)
                : [String(estados)]
              : [
                  "AC",
                  "AL",
                  "AP",
                  "AM",
                  "BA",
                  "CE",
                  "DF",
                  "ES",
                  "GO",
                  "MA",
                  "MT",
                  "MS",
                  "MG",
                  "PA",
                  "PB",
                  "PR",
                  "PE",
                  "PI",
                  "RJ",
                  "RN",
                  "RS",
                  "RO",
                  "RR",
                  "SC",
                  "SP",
                  "SE",
                  "TO"
                ],
            anos
              ? Array.isArray(anos)
                ? anos.map(String)
                : String(anos).split(",")
              : [],
            museu ? String(museu) : null,
            cidades
              ? Array.isArray(cidades)
                ? cidades.map(String)
                : [String(cidades)]
              : []
          )
        )
    } catch (error) {
      logger.error("Erro ao buscar declarações por ano:", error)
      return res
        .status(500)
        .json({ message: "Erro ao buscar declarações por ano." })
    }
  }

  async getDeclaracaoFiltrada(req: Request, res: Response) {
    try {
      const declaracoes = await this.declaracaoService.declaracaoComFiltros(
        req.body
      )
      return res.status(200).json(declaracoes)
    } catch (error) {
      logger.error("Erro ao buscar declarações com filtros:", error)
      return res
        .status(500)
        .json({ message: "Erro ao buscar declarações com filtros." })
    }
  }

  /**
   * Realiza a operação de exclusão lógica de  uma declaração ao definir a propriedade `isExcluded` como `true`.
   * A exclusão só é permitida se a declaração tiver o status `Recebida`.
   *
   * @param {string} id - O ID da declaração a ser excluída.
   * @throws {Error} - Lança um erro se a declaração não for encontrada ou
   * se o status da declaração não for `Recebida`.
   *
   * @returns {Promise<void>} - Retorna uma Promise que se resolve em void
   * quando a exclusão é concluída.
   */

  async excluirDeclaracao(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      await this.declaracaoService.excluirDeclaracao(id)
      return res.status(204).send()
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (
          error.message ===
          "Declaração está em período de análise. Não pode ser excluída."
        ) {
          return res.status(406).json({ message: error.message })
        } else if (error.message === "Declaração não encontrada.") {
          return res.status(404).json({ message: error.message })
        }
      }
      return res.status(500).json({ message: "Erro ao excluir declaração." })
    }
  }
  /**
   * Cria uma nova declaração ou retifica uma declaração existente, associando-a a um museu e ao responsável.
   *
   * @param {string} req.params.anoDeclaracao - O ano da declaração, fornecido na URL.
   * @param {string} req.params.museu - O ID do museu associado à declaração, fornecido na URL.
   * @param {string} req.params.idDeclaracao - O ID da declaração existente que está sendo retificada, se aplicável.
   *
   * @returns {Promise<Response>} - Retorna uma resposta HTTP que contém o status da operação e a declaração criada ou um erro.
   *
   * @throws {400} - Se dados obrigatórios estão ausentes ou o museu não é válido.
   * @throws {404} - Se a declaração a ser retificada não for encontrada.
   * @throws {500} - Se ocorrer um erro interno ao processar a declaração.
   */
  async criarDeclaracao(req: Request, res: Response) {
    try {
      const { anoDeclaracao, museu: museu_id, idDeclaracao } = req.params
      const user_id = req.user.id

      if (!museu_id || !user_id) {
        return res
          .status(400)
          .json({ success: false, message: "Dados obrigatórios ausentes" })
      }

      const museu = await Museu.findOne({ _id: museu_id, usuario: user_id })
      if (!museu) {
        return res
          .status(400)
          .json({ success: false, message: "Museu inválido" })
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] }
      const salt = generateSalt()

      const declaracaoExistente = idDeclaracao
        ? await Declaracoes.findOne({
            _id: idDeclaracao,
            responsavelEnvio: user_id,
            anoDeclaracao,
            museu_id: museu_id
          }).exec()
        : await this.declaracaoService.verificarDeclaracaoExistente(
            museu_id,
            anoDeclaracao
          )

      if (idDeclaracao && !declaracaoExistente) {
        return res.status(404).json({
          message: "Não foi encontrada uma declaração anterior para retificar."
        })
      }

      if (idDeclaracao && declaracaoExistente?.ultimaDeclaracao == false) {
        return res.status(406).json({
          message:
            "Apenas a versão mais recente da declaração pode ser retificada."
        })
      }

      const ultimaDeclaracao = await Declaracoes.findOne({
        museu_id,
        anoDeclaracao
      })
        .sort({ versao: -1 })
        .exec()
      const novaVersao = (ultimaDeclaracao?.versao || 0) + 1

      const responsavelEnvio = await Usuario.findById(user_id).select("nome")
      if (!responsavelEnvio) {
        return res
          .status(404)
          .json({ message: "Usuário responsável pelo envio não encontrado." })
      }

      const novaDeclaracaoData =
        await this.declaracaoService.criarDadosDeclaracao(
          museu,
          user_id as unknown as mongoose.Types.ObjectId,
          anoDeclaracao,
          declaracaoExistente,
          novaVersao,
          salt,
          DataUtils.getCurrentData(),
          responsavelEnvio.nome
        )

      const novaDeclaracao = new Declaracoes(novaDeclaracaoData)
      if (idDeclaracao && declaracaoExistente) {
        const timeLineAnterior = ultimaDeclaracao?.timeLine || []
        const novoEvento = {
          nomeEvento: Eventos.RetificacaoDeclaracao,
          dataEvento: DataUtils.getCurrentData(),
          autorEvento: responsavelEnvio.nome
        }
        novaDeclaracao.timeLine = [...timeLineAnterior, novoEvento].sort(
          (a, b) =>
            new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime()
        )
      } else {
        novaDeclaracao.timeLine.push({
          nomeEvento: Eventos.EnvioDeclaracao,
          dataEvento: DataUtils.getCurrentData(),
          autorEvento: responsavelEnvio.nome
        })
      }

      await this.declaracaoService.updateDeclaracao(
        files["arquivistico"],
        novaDeclaracao,
        "arquivistico",
        declaracaoExistente?.arquivistico || null,
        novaVersao,
        responsavelEnvio.nome
      )
      await this.declaracaoService.updateDeclaracao(
        files["bibliografico"],
        novaDeclaracao,
        "bibliografico",
        declaracaoExistente?.bibliografico || null,
        novaVersao,
        responsavelEnvio.nome
      )
      await this.declaracaoService.updateDeclaracao(
        files["museologico"],
        novaDeclaracao,
        "museologico",
        declaracaoExistente?.museologico || null,
        novaVersao,
        responsavelEnvio.nome
      )

      novaDeclaracao.ultimaDeclaracao = true
      await novaDeclaracao.save()

      await Declaracoes.updateMany(
        {
          museu_id,
          anoDeclaracao,
          _id: { $ne: novaDeclaracao._id }
        },
        { ultimaDeclaracao: false }
      )

      return res.status(200).json(novaDeclaracao)
    } catch (error) {
      logger.error("Erro ao enviar uma declaração:", error)
      return res
        .status(500)
        .json({ message: "Erro ao enviar uma declaração: ", error })
    }
  }

  async downloadDeclaracao(req: Request, res: Response) {
    try {
      const { museu, anoDeclaracao, tipoArquivo } = req.params
      const user_id = req.user.id

      // Verifique a declaração para o usuário
      const declaracao = await Declaracoes.findOne({
        museu_id: museu,
        anoDeclaracao,
        responsavelEnvio: user_id
      })

      if (!declaracao) {
        return res.status(404).json({
          message: "Declaração não encontrada para o ano especificado."
        })
      }

      const prefix = `${museu}/${anoDeclaracao}/${tipoArquivo}/`
      const bucketName = "inbcm"

      const latestFilePath = await getLatestPathArchive(bucketName, prefix)

      if (!latestFilePath) {
        return res
          .status(404)
          .json({ message: "Arquivo não encontrado para o tipo especificado." })
      }

      const fileStream = await minioClient.getObject(bucketName, latestFilePath)

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${path.basename(latestFilePath)}`
      )
      res.setHeader("Content-Type", "application/octet-stream")

      fileStream.pipe(res)
    } catch (error) {
      logger.error("Erro ao baixar arquivo da declaração:", error)
      return res
        .status(500)
        .json({ message: "Erro ao baixar arquivo da declaração." })
    }
  }

  async getTimeLine(req: Request, res: Response) {
    try {
      const { id } = req.params

      const declaracaoId = new mongoose.Types.ObjectId(id)

      const declaracao = await Declaracoes.findById(declaracaoId, {
        timeLine: 1
      }).exec()

      if (!declaracao) {
        return res.status(404).json({ error: "Declaração não encontrada." })
      }

      const isAdmin = req.user?.admin

      const processedTimeline = declaracao.timeLine.map((evento) => {
        if (
          !isAdmin &&
          (evento.nomeEvento === "Envio para análise" ||
            evento.nomeEvento === "Declaração enviada para o analista")
        ) {
          return {
            nomeEvento: evento.nomeEvento,
            dataEvento: evento.dataEvento
          }
        }

        return evento
      })

      return res.json(processedTimeline)
    } catch (error) {
      logger.error(error)
      return res.status(500).json({ error: "Erro ao obter a timeline." })
    }
  }

  async uploadDeclaracao(req: Request, res: Response) {
    const declaracaoExistente =
      await this.declaracaoService.verificarDeclaracaoExistente(
        req.params.museu,
        req.params.anoDeclaracao
      )

    if (declaracaoExistente) {
      return res.status(406).json({
        status: false,
        message:
          "Já existe declaração para museu e ano referência informados. Para alterar a declaração é preciso retificá-la ou excluí-la e declarar novamente."
      })
    }
    return this.criarDeclaracao(req, res)
  }

  async retificarDeclaracao(req: Request, res: Response) {
    return this.criarDeclaracao(req, res)
  }

  /**
   * Lista todos os analistas disponíveis para análise de declarações.
   *
   * Esse método consulta a camada de serviço para obter uma lista de analistas disponíveis e retorna essa lista na resposta.
   *
   * @param {Request} req - O objeto de solicitação (request). Não são esperados parâmetros ou corpo para essa rota.
   * @param {Response} res - O objeto de resposta (response).
   *   - Status 200: Retorna um JSON contendo a lista de analistas.
   *   - Status 500: Retorna uma mensagem de erro caso haja falha na operação.
   * @returns {Promise<Response>} Retorna uma resposta com a lista de analistas ou uma mensagem de erro.
   */
  async listarAnalistas(req: Request, res: Response): Promise<Response> {
    try {
      const analistas = await this.declaracaoService.listarAnalistas()

      return res.status(200).json(analistas)
    } catch (error) {
      return res.status(500).json({
        message:
          "Ocorreu um erro ao listar os analistas. Tente novamente mais tarde."
      })
    }
  }

  /**
   * Envia a declaração para análise.
   *
   * Esse método recebe o ID da declaração e uma lista de IDs de analistas, atualiza o status da declaração e registra o evento no histórico.
   *
   * @param {Request} req - O objeto de solicitação (request).
   *   - `params`: Contém o ID da declaração (`id`) a ser enviada para análise.
   *   - `body`: Deve conter uma lista de IDs de analistas responsáveis pela análise da declaração (`analistas`).
   *   - `user`: O objeto do usuário autenticado, contendo o ID do administrador (`adminId`) que está enviando a declaração.
   * @param {Response} res - O objeto de resposta (response).
   *   - Status 200: Retorna a declaração enviada para análise.
   *   - Status 500: Retorna um erro em caso de falha no envio.
   * @returns {Promise<Response>} Retorna um JSON com a declaração atualizada ou uma mensagem de erro.
   */
  async enviarParaAnalise(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    const { analistas } = req.body
    const adminId = req.user?.id

    try {
      const declaracao = await this.declaracaoService.enviarParaAnalise(
        id,
        analistas,
        adminId
      )

      return res.status(200).json(declaracao)
    } catch (error) {
      logger.error("Erro ao enviar declaração para análise:", error)
      return res
        .status(500)
        .json({ message: "Erro ao enviar declaração para análise." })
    }
  }

  /**
   * Conclui a análise de uma declaração.
   *
   * Esse método atualiza o status da declaração para "Em Conformidade" ou "Não Conformidade" e registra a conclusão da análise no histórico da declaração.
   *
   * @param {Request} req - O objeto de solicitação (request).
   *   - `params`: Contém o ID da declaração (`id`) e o ID do analista que concluiu a análise (`idAnalita`).
   *   - `body`: Deve conter o status final da análise (`status`), que pode ser "Em conformidade" ou "Não conformidade".
   * @param {Response} res - O objeto de resposta (response).
   *   - Status 200: Retorna a declaração com o status atualizado e a data de conclusão da análise.
   *   - Status 500: Retorna um erro caso haja problemas ao concluir a análise.
   * @returns {Promise<Response>} Retorna um JSON com a declaração atualizada ou uma mensagem de erro.

   */
  async concluirAnalise(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    const { status } = req.body

    try {
      const declaracao = await this.declaracaoService.concluirAnalise(
        id,
        status
      )
      return res.status(200).json(declaracao)
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erro ao concluir análise da declaração." })
    }
  }
  /**
   * Obtém a quantidade de declarações agrupadas por analista, considerando um filtro de tempo (anos).
   *
   * Este método realiza uma consulta agregada no banco de dados MongoDB para agrupar declarações
   * por analista e ano da declaração, limitando as declarações aos últimos X anos, conforme definido
   * pelo parâmetro da query. Além disso,retorna a quantidade de declarações associadas.
   *
   * @param {Request} req - O objeto da requisição HTTP. Pode conter:
   *   @param {string} req.query.anos - O número de anos a ser considerado no filtro (opcional). Se omitido, o filtro padrão é 5 anos.
   *
   * @param {Response} res - O objeto de resposta HTTP que será utilizado para retornar os dados processados.
   *   A resposta será um JSON contendo:
   *   - analista: Objeto com as informações do analista (nome, email, etc).
   *   - anoDeclaracao: O ano da declaração.
   *   - quantidadeDeclaracoes: A quantidade de declarações feitas por aquele analista naquele ano.
   *
   * @return {Promise<void>} Retorna uma Promise que, ao ser resolvida, envia a resposta HTTP em formato JSON.
   * Em caso de erro, retorna uma mensagem de erro com status 500.
   */
  async getDeclaracoesAgrupadasPorAnalista(req: Request, res: Response) {
    try {
      const { anos } = req.query
      const anosFiltro = anos ? parseInt(anos as string) : 5

      const anoLimite = new Date().getFullYear() - anosFiltro

      const resultado = await Declaracoes.aggregate([
        {
          $match: {
            anoDeclaracao: { $gte: anoLimite.toString() },
            analistasResponsaveis: { $exists: true, $not: { $size: 0 } }
          }
        },
        {
          $unwind: "$analistasResponsaveis"
        },
        {
          $group: {
            _id: {
              analista: "$analistasResponsaveis",
              anoDeclaracao: "$anoDeclaracao"
            },
            quantidadeDeclaracoes: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "usuarios",
            localField: "_id.analista",
            foreignField: "_id",
            as: "analista"
          }
        },
        {
          $unwind: {
            path: "$analista",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 0,
            analista: {
              _id: "$analista._id",
              nome: "$analista.nome",
              email: "$analista.email"
            },
            anoDeclaracao: "$_id.anoDeclaracao",
            quantidadeDeclaracoes: 1
          }
        }
      ])

      res.status(200).json(resultado)
    } catch (error) {
      logger.error(error)
      res
        .status(500)
        .json({ error: "Erro ao buscar declarações agrupadas por analista" })
    }
  }

  async getItensPorAnoETipo(req: Request, res: Response): Promise<Response> {
    try {
      const { museuId, anoInicio, anoFim } = req.params
      const user_id = req.user.id

      if (!museuId || !anoInicio || !anoFim) {
        return res.status(400).json({
          success: false,
          message:
            "Parâmetros insuficientes. Forneça id do museu, ano inicio  e ano fim."
        })
      }

      const anoInicioNum = parseInt(anoInicio, 10)
      const anoFimNum = parseInt(anoFim, 10)

      if (isNaN(anoInicioNum) || isNaN(anoFimNum)) {
        return res.status(400).json({
          success: false,
          message:
            "Anos inválidos fornecidos. Certifique-se de enviar valores numéricos."
        })
      }

      if (anoInicioNum > anoFimNum) {
        return res.status(400).json({
          success: false,
          message: "Ano de início deve ser menor ou igual ao ano de fim."
        })
      }

      const museu = await Museu.findOne({ _id: museuId, usuario: user_id })
      if (!museu) {
        return res.status(404).json({
          success: false,
          message: "Museu não encontrado ou usuário não autorizado."
        })
      }

      const agregacao = await this.declaracaoService.getItensPorAnoETipo(
        museuId,
        anoInicioNum,
        anoFimNum
      )

      if (!agregacao || agregacao.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Nenhuma declaração encontrada para os parâmetros fornecidos."
        })
      }
      return res.status(200).json({
        success: true,
        message: "Dados encontrados com sucesso.",
        data: agregacao
      })
    } catch (error) {
      logger.error("Erro ao processar a requisição: ", error)

      return res.status(500).json({
        success: false,
        message: "Erro ao processar a requisição.",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      })
    }
  }

  async getAnosValidos(req: Request, res: Response): Promise<void> {
    try {
      const { qtdAnos } = req.params

      // Define um valor padrão caso `qtdAnos` não seja fornecido ou seja inválido
      const anosQuantidade = parseInt(qtdAnos, 10) || 10

      // Calcula os anos válidos
      const anoAtual = new Date().getFullYear()
      const anosValidos = Array.from(
        { length: anosQuantidade },
        (_, index) => anoAtual - index
      )

      // Envia a lista de anos válidos na resposta
      res.json({ anos: anosValidos })
    } catch (error) {
      logger.error("Erro ao obter anos válidos:", error)
      res.status(500).json({ message: "Erro ao obter anos válidos" })
    }
  }

  /**
   * Lista itens por tipo de bem cultural para um museu específico em um determinado ano.
   * @param {string} req.params.museuId - O ID do museu.
   * @param {string} req.params.ano - O ano da declaração.
   * @param {string} req.params.tipo - O tipo de item (Arquivistico, Bibliografico, Museologico).
   * @description Este método verifica se o museu pertence ao usuário que está fazendo a requisição, e se válido, busca itens de um tipo específico (Arquivistico, Bibliografico, Museologico) da maior versão da declaração para aquele museu e ano.
   * @returns {Promise<void>} - Retorna uma promessa que resolve quando a resposta é enviada ao cliente. A promessa não retorna nenhum valor, mas durante sua execução, ela pode enviar uma resposta JSON contendo os itens encontrados ou uma mensagem de erro apropriada.
   */
  async listarItensPorTipodeBem(req: Request, res: Response) {
    const { museuId, ano, tipo } = req.params
    const user_id = req.user.id

    try {
      const museu = await Museu.findOne({ _id: museuId, usuario: user_id })

      if (!museu) {
        return res.status(400).json({
          success: false,
          message: "Museu inválido ou você não tem permissão para acessá-lo"
        })
      }

      const result = await this.declaracaoService.buscarItensPorTipo(
        museuId,
        ano,
        user_id,
        tipo
      )

      if (!result) {
        return res
          .status(404)
          .json({ message: `Itens ${tipo} não encontrados` })
      }

      res.status(200).json(result)
    } catch (error) {
      logger.error(`Erro ao listar itens ${tipo}:`, error)

      if (error instanceof Error) {
        res.status(500).json({
          message: `Erro ao listar itens ${tipo}`,
          error: error.message
        })
      } else {
        res
          .status(500)
          .json({ message: `Erro desconhecido ao listar itens ${tipo}` })
      }
    }
  }
}

export default DeclaracaoController
