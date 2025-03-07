import { Request, Response } from "express"
import { Declaracoes, Usuario } from "../models"
import { AnoDeclaracao } from "../models/AnoDeclaracao"
import DeclaracaoService from "../service/DeclaracaoService"
import { generateSalt } from "../utils/hashUtils"
import { Museu } from "../models"
import path from "path"
import mongoose, { PipelineStage } from "mongoose"
import {
  generateFilePathAnalise,
  getLatestPathArchive,
  uploadFileAnaliseToMinio,
  uploadFileToMinio
} from "../utils/minioUtil"
import minioClient from "../db/minioClient"
import { DataUtils } from "../utils/dataUtils"
import { Status } from "../enums/Status"
import { Eventos } from "../enums/Eventos"
import logger from "../utils/logger"
import { IProfile } from "../models/Profile"
import HTTPError from "../utils/error"

export class DeclaracaoController {
  private declaracaoService: DeclaracaoService

  // Faz o bind do contexto atual para os métodos
  constructor() {
    this.declaracaoService = new DeclaracaoService()

    this.uploadDeclaracao = this.uploadDeclaracao.bind(this)
    this.getDeclaracaoFiltrada = this.getDeclaracaoFiltrada.bind(this)
    this.atualizarStatusBensDeclaracao =
      this.atualizarStatusBensDeclaracao.bind(this)
    this.getDeclaracoes = this.getDeclaracoes.bind(this)
    this.getDeclaracao = this.getDeclaracao.bind(this)
    this.getDeclaracaoAno = this.getDeclaracaoAno.bind(this)
    this.getItensPorAnoETipo = this.getItensPorAnoETipo.bind(this)
    this.excluirDeclaracao = this.excluirDeclaracao.bind(this)
    this.getTimeLine = this.getTimeLine.bind(this)
    this.restaurarDeclaracao = this.restaurarDeclaracao.bind(this)
    this.alterarAnalistaArquivo = this.alterarAnalistaArquivo.bind(this)
    this.uploadAnalise = this.uploadAnalise.bind(this)
    this.downloadAnalise = this.downloadAnalise.bind(this)
  }

  /**
   * Altera o analista responsável por um arquivo vinculado a uma declaração.
   *
   * @param req - O objeto de requisição, contendo os parâmetros da URL e o usuário autenticado.
   * @param res - O objeto de resposta para enviar a resposta ao cliente.
   *
   * @param req.params.declaracaoId - O ID da declaração à qual o arquivo está vinculado.
   * @param req.params.arquivoTipo - O tipo do arquivo cujo analista será alterado.
   * Deve ser um dos seguintes valores: "arquivistico", "bibliografico" ou "museologico".
   *
   * @param req.user.id - O ID do usuário autenticado que será usado como analista e autor da alteração.
   *
   * A função utiliza o serviço de declarações para alterar o analista responsável pelo arquivo,
   * garantindo que o `analistaId` e o `autorId` sejam atribuídos corretamente.
   *
   * @returns Retorna um objeto JSON com o resultado da operação, ou uma mensagem de erro em caso de falha.
   *
   * Exemplo de resposta bem-sucedida:
   * {
   *   mensagem: "Analista atualizado com sucesso",
   *   arquivoAtualizado: {
   *     tipo: "museologico",
   *     analistaId: "12345",
   *     autorId: "12345",
   *     dataAlteracao: "2025-01-07T12:00:00Z"
   *   }
   * }
   *
   * @throws Retorna status 400 com uma mensagem de erro em caso de falhas esperadas
   * (como parâmetros inválidos ou ausência de permissões).
   * @throws Retorna status 500 em caso de erros inesperados no servidor.
   */

  async alterarAnalistaArquivo(req: Request, res: Response) {
    try {
      const { declaracaoId, arquivoTipo } = req.params
      const analistaId = req.user?.id
      const autorId = req.user?.id

      const resultado = await this.declaracaoService.alterarAnalistaArquivo(
        declaracaoId,
        arquivoTipo as "arquivistico" | "bibliografico" | "museologico",
        analistaId,
        autorId
      )

      return res.status(200).json(resultado)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: "Erro desconhecido" })
    }
  }

  /**
   * Atualiza os status dos bens vinculados a uma declaração e altera o status geral da declaração.
   *
   * @param req - O objeto de requisição, contendo o ID da declaração na URL e o status dos bens no corpo.
   * @param res - O objeto de resposta para enviar a resposta ao cliente.
   *
   * @param req.body.statusBens - Um objeto contendo os novos status para os bens vinculados à declaração.
   * Cada chave deste objeto representa um tipo de bem (museológico, arquivístico, bibliográfico), e o valor associado é um objeto
   * contendo o novo `status` e, opcionalmente, um `comentario` explicativo sobre a alteração.
   *
   * Exemplo de estrutura de `statusBens`:
   * {
   *   museologico: { status: Status.EmConformidade, comentario: "Comentário sobre o bem museológico" },
   *   arquivistico: { status: Status.EmConformidade },
   *   bibliografico: { status: Status.NaoConformidade, comentario: "Comentário sobre o bem bibliográfico" }
   * }
   *
   * @param req.body.autorId - O ID do autor (usuário) responsável pela atualização dos status dos bens.
   */

  async atualizarStatusBensDeclaracao(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { statusBens } = req.body
      const autorId = req.user?.id
      const arquivo = req.file

      const resultado = await this.declaracaoService.atualizarStatusBens(
        id,
        statusBens,
        autorId
      )

      return res.status(200).json(resultado)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message })
      }

      return res.status(500).json({ message: "Erro desconhecido" })
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
        return res.status(204).json({
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
      const userId = req.user?.id

      const user = await Usuario.findById(userId).populate("profile")

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." })
      }

      const userProfile = (user.profile as IProfile).name

      const declaracao = await Declaracoes.findById(id)
        .populate({
          path: "museu_id",
          model: Museu
        })
        .populate({
          path: "anoDeclaracao",
          model: AnoDeclaracao
        })

      if (!declaracao) {
        logger.error("Declaração não encontrada.")
        return res.status(404).json({ message: "Declaração não encontrada." })
      }

      if (declaracao.ultimaDeclaracao === false) {
        logger.error("Declaração não pode ser acessada.")
        return res
          .status(404)
          .json({ message: "Não é possível acessar declaração." })
      }

      if (userProfile !== "analyst") {
        logger.info("Usuário não é analista, retornando todos os dados.")
        return res.status(200).json(declaracao)
      }

      const userObjectId = new mongoose.Types.ObjectId(userId)
      const camposValidos: Array<
        "museologico" | "bibliografico" | "arquivistico"
      > = ["museologico", "bibliografico", "arquivistico"]

      logger.info(`Campos a serem verificados: ${camposValidos.join(", ")}`)

      const camposFiltrados = camposValidos.reduce(
        (acc, campo) => {
          const dadosCampo = declaracao[campo]
          logger.info(`Verificando campo: ${campo}`)
          logger.info(
            `Responsáveis no campo "${campo}": ${dadosCampo?.analistasResponsaveis}`
          )

          if (
            dadosCampo?.analistasResponsaveis?.some(
              (analistaId: mongoose.Types.ObjectId) =>
                analistaId.equals(userObjectId)
            )
          ) {
            logger.info(`Usuário ${userId} é responsável pelo campo "${campo}"`)
            acc[campo] = dadosCampo // Adiciona o campo ao resultado se o analista for responsável
          } else {
            logger.info(
              `Usuário ${userId} NÃO é responsável pelo campo "${campo}"`
            )
          }

          return acc
        },
        {} as Record<string, unknown>
      )

      logger.info(
        `Campos filtrados: ${Object.keys(camposFiltrados).join(", ")}`
      )

      // Retorna a declaração com os campos filtrados
      return res.status(200).json({
        ...declaracao.toObject(), // Copia os demais dados da declaração
        ...camposFiltrados, // Sobrescreve os campos com os dados filtrados
        museologico: camposFiltrados.museologico || undefined,
        bibliografico: camposFiltrados.bibliografico || undefined,
        arquivistico: camposFiltrados.arquivistico || undefined
      })
    } catch (error) {
      logger.error("Erro ao buscar declaração:", error)
      return res.status(500).json({ message: "Erro ao buscar declaração." })
    }
  }

  // retorna todas as declarações do usuário logado
  async getDeclaracoes(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const user = await Usuario.findById(userId).populate("profile")

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." })
      }

      const userProfile = (user.profile as IProfile).name

      let agregacao: PipelineStage[] = [
        {
          $match: {
            responsavelEnvio: new mongoose.Types.ObjectId(userId),
            status: { $ne: Status.Excluida },
            ultimaDeclaracao: true
          }
        },
        {
          $sort: { anoDeclaracao: 1, museu_nome: 1, createdAt: -1 }
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
      ]

      if (userProfile === "analyst") {
        agregacao = [
          {
            $match: {
              status: { $ne: Status.Excluida },
              ultimaDeclaracao: true,
              $or: [
                {
                  "arquivistico.analistasResponsaveis":
                    new mongoose.Types.ObjectId(userId)
                },
                {
                  "bibliografico.analistasResponsaveis":
                    new mongoose.Types.ObjectId(userId)
                },
                {
                  "museologico.analistasResponsaveis":
                    new mongoose.Types.ObjectId(userId)
                }
              ]
            }
          },
          {
            $sort: { anoDeclaracao: 1, museu_nome: 1, createdAt: -1 }
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
        ]
      }

      const resultado = await Declaracoes.aggregate(agregacao)

      const declaracoesPopuladas = await Museu.populate(resultado, [
        {
          path: "museu_id",
          model: Museu
        },
        { path: "anoDeclaracao", model: AnoDeclaracao }
      ])

      return res.status(200).json(declaracoesPopuladas)
    } catch (error) {
      console.error("Erro ao buscar declarações:", error)
      return res.status(500).json({ message: "Erro ao buscar declarações." })
    }
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
        novaDeclaracao.status = Status.Recebida
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
  async uploadAnalise(req: Request, res: Response) {
    try {
      const { declaracaoId, tipoArquivo } = req.params

      // Acessando o arquivo de acordo com o tipoArquivo
      const file = req.files?.[tipoArquivo]?.[0]
      console.log(file)

      if (!file) {
        return res.status(400).json({
          error:
            "Nenhum arquivo foi enviado para o tipo de arquivo: " + tipoArquivo
        })
      }

      const declaracao = await Declaracoes.findById(declaracaoId)
      if (!declaracao) {
        return res.status(404).json({ error: "Declaração não encontrada" })
      }
      console.log("declaracao", declaracao)
      console.log(declaracao.anoDeclaracao)

      const tiposArquivos = ["museologico", "bibliografico", "arquivistico"]
      if (!tiposArquivos.includes(tipoArquivo)) {
        return res.status(400).json({ error: "Tipo de arquivo inválido" })
      }

      const filePath = generateFilePathAnalise(
        file.originalname,
        declaracaoId,
        tipoArquivo
      )

      await uploadFileAnaliseToMinio(file, declaracaoId, tipoArquivo)

      // Verifica se o tipo de arquivo já existe na declaração e atualiza o caminho
      if (declaracao[tipoArquivo]) {
        // Atualiza o caminho do arquivo existente (ex: urlAnalise ou o campo correspondente)
        declaracao[tipoArquivo].analiseUrl = filePath
      } else {
        // Se não existir o tipo de arquivo, cria o campo com o caminho do arquivo
        declaracao[tipoArquivo] = { analiseUrl: filePath }
      }

      // Salva a declaração com o caminho atualizado do arquivo
      await declaracao.save()

      return res.status(201).json({
        message: "Arquivo anexado com sucesso",
        declaracaoAtualizada: declaracao
      })
    } catch (error) {
      console.log(error)
      return res
        .status(500)
        .json({ error: "Erro ao anexar arquivo à declaração" })
    }
  }

  async downloadDeclaracao(req: Request, res: Response) {
    try {
      const { museu, anoDeclaracao, tipoArquivo } = req.params

      const declaracao = await Declaracoes.findOne({
        museu_id: museu,
        anoDeclaracao
      }).populate("anoDeclaracao", ["_id", "ano"], AnoDeclaracao)

      if (!declaracao) {
        return res.status(404).json({
          message: "Declaração não encontrada para o ano especificado."
        })
      }

      const prefix = `${museu}/${(declaracao.anoDeclaracao as unknown as { ano: number }).ano}/${tipoArquivo}/`
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
  async downloadAnalise(req: Request, res: Response) {
    try {
      console.log("Parâmetros recebidos:", req.params) // 👀 Verificar o que está chegando

      const { declaracaoId, tipoArquivo } = req.params

      if (!declaracaoId || !tipoArquivo) {
        return res.status(400).json({ message: "Parâmetros inválidos." })
      }

      const prefix = `analise/${declaracaoId}/${tipoArquivo}/`
      const bucketName = "inbcm"

      console.log("Prefixo do arquivo:", prefix) // 🔍 Verificar caminho

      const latestFilePath = await getLatestPathArchive(bucketName, prefix)

      if (!latestFilePath) {
        return res
          .status(404)
          .json({ message: "Arquivo de análise não encontrado." })
      }

      console.log("Caminho do arquivo encontrado:", latestFilePath)

      const fileStream = await minioClient.getObject(bucketName, latestFilePath)

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${path.basename(latestFilePath)}`
      )
      res.setHeader("Content-Type", "application/octet-stream")

      fileStream.pipe(res)
    } catch (error) {
      console.error("Erro ao baixar arquivo de análise:", error)
      return res
        .status(500)
        .json({ message: "Erro ao baixar arquivo de análise." })
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
   * Controlador responsável por chamar o método de serviço para restaurar uma declaração
   * para o status 'Recebida' quando ela estiver com status 'Excluída'.
   *
   * @param req - A requisição HTTP contendo o ID da declaração a ser restaurada
   * @param res - A resposta HTTP que será retornada para o cliente
   * @returns A resposta HTTP com sucesso ou erro, dependendo do resultado da operação
   */
  async restaurarDeclaracao(req: Request, res: Response) {
    try {
      const { declaracaoId } = req.params

      const resultado =
        await this.declaracaoService.restauraDeclaracao(declaracaoId)

      return res.status(200).json(resultado)
    } catch (error) {
      logger.error("Erro ao deletar usuário:", error)

      if (error instanceof HTTPError) {
        return res.status(error.status).json({ message: error.message })
      }

      return res.status(500).json({ message: "Erro ao restaurar declaração." })
    }
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
      const { especificidade, nomeAnalista } = req.query

      const especificidadesArray = especificidade
        ? especificidade
            .toString()
            .split(",")
            .map((item) => item.trim())
        : undefined

      // Validar as especificidades, se fornecido
      if (especificidadesArray) {
        const tiposValidos = ["museologico", "bibliografico", "arquivistico"]
        const especificidadesInvalidas = especificidadesArray.filter(
          (tipo) => !tiposValidos.includes(tipo)
        )

        if (especificidadesInvalidas.length > 0) {
          return res.status(400).json({
            message: `Os seguintes valores de 'especificidade' são inválidos: ${especificidadesInvalidas.join(
              ", "
            )}. Valores válidos: ${tiposValidos.join(", ")}.`
          })
        }
      }

      // Consultar analistas (com ou sem filtro de especificidade e nome)
      const analistas = await this.declaracaoService.listarAnalistas(
        especificidadesArray,
        nomeAnalista?.toString()
      )

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

    if (!analistas || !adminId) {
      return res
        .status(400)
        .json({ message: "Analistas ou adminId não fornecidos." })
    }

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
        return res.status(204).json({
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

  async listarItensPorTipodeBemAdmin(req: Request, res: Response) {
    const { museuId, ano, tipo } = req.params

    try {
      const result = await this.declaracaoService.buscarItensPorTipoAdmin(
        museuId,
        ano,
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
