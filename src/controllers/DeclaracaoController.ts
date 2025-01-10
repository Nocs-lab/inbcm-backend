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

  // Faz o bind do contexto atual para os métodos
  constructor() {
    this.declaracaoService = new DeclaracaoService()

    this.uploadDeclaracao = this.uploadDeclaracao.bind(this)
    this.getDeclaracaoFiltrada = this.getDeclaracaoFiltrada.bind(this)
    this.getStatusEnum = this.getStatusEnum.bind(this)
    this.atualizarStatusBensDeclaracao =
      this.atualizarStatusBensDeclaracao.bind(this)
    this.getDeclaracoes = this.getDeclaracoes.bind(this)
    this.getDeclaracao = this.getDeclaracao.bind(this)
    this.getDeclaracaoAno = this.getDeclaracaoAno.bind(this)
    this.getItensPorAnoETipo = this.getItensPorAnoETipo.bind(this)
    this.getDashboard = this.getDashboard.bind(this)
    this.excluirDeclaracao = this.excluirDeclaracao.bind(this)
    this.getTimeLine = this.getTimeLine.bind(this)
    this.filtroDashBoard = this.filtroDashBoard.bind(this)
    this.restaurarDeclaracao = this.restaurarDeclaracao.bind(this)
    this.alterarAnalistaArquivo = this.alterarAnalistaArquivo.bind(this)
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

  async filtroDashBoard(req: Request, res: Response) {
    try {
      // Lista de estados válidos
      const estadosValidos = [
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
      ]

      // Extraindo os filtros da query string
      const { anos, estados, cidades, museu } = req.query

      // Garantindo que os filtros sejam arrays
      const anosArray = anos
        ? Array.isArray(anos)
          ? anos.map(String)
          : String(anos).split(",") // Caso sejam passados como "anos=2023&anos=2024"
        : []

      const estadosArray = estados
        ? Array.isArray(estados)
          ? estados.map(String)
          : [String(estados)]
        : []

      // Validando os estados
      const estadosInvalidos = estadosArray.filter(
        (estado) => !estadosValidos.includes(estado.toUpperCase())
      )
      if (estadosInvalidos.length > 0) {
        return res.status(400).json({
          message: "Estados inválidos encontrados.",
          invalidStates: estadosInvalidos
        })
      }

      const cidadesArray = cidades
        ? Array.isArray(cidades)
          ? cidades.map(String)
          : [String(cidades)]
        : []

      const museuId = museu ? String(museu) : null
      if (museuId && !museuId.match(/^[a-fA-F0-9]{24}$/)) {
        return res.status(400).json({
          message:
            "O campo 'museu' deve conter um ID válido no formato ObjectId."
        })
      }

      // Chamando o método do serviço para realizar o filtro
      const declaracoes =
        await this.declaracaoService.filtroDeclaracoesDashBoard(
          anosArray,
          estadosArray,
          cidadesArray,
          museuId
        )

      // Retornando as declarações filtradas
      return res.status(200).json(declaracoes)
    } catch (error) {
      // Logando o erro em caso de falha
      logger.error("Erro ao filtrar declarações para o dashboard:", error)

      // Retornando status 500 com uma mensagem de erro
      return res
        .status(500)
        .json({ message: "Erro ao filtrar declarações para o dashboard." })
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
      const userId = req.user?.id
      const isAdmin = req.user?.admin

      // Verifica se o usuário está logado
      if (!userId) {
        return res.status(400).json({ message: "Usuário não autenticado." })
      }

      const user = await Usuario.findById(userId).populate("profile")

      // Verifica se o perfil do usuário foi encontrado
      if (!user || !user.profile) {
        return res
          .status(400)
          .json({ message: "Perfil do usuário não foi encontrado." })
      }

      // Se for admin, não precisa filtrar nada
      const selectFields = isAdmin
        ? ""
        : "-responsavelEnvioAnaliseNome -analistasResponsaveisNome -responsavelEnvioAnalise -analistasResponsaveis"

      // Buscar a declaração com o campo de museu populado
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

      // Filtragem dos dados de acordo com o perfil do usuário
      if (user.profile.name === "analyst") {
        const especialidadeAnalista = user.especialidadeAnalista
        const analistaId = userId // ID do analista logado

        // Inicializa um objeto para armazenar os dados filtrados
        const dadosFiltrados: any = {}

        // Verifica cada tipo (museológico, arquivístico, bibliográfico) na declaração
        if (
          especialidadeAnalista.includes("museologico") &&
          declaracao.museologico &&
          Array.isArray(declaracao.museologico.analistasResponsaveis) &&
          declaracao.museologico.analistasResponsaveis.includes(analistaId)
        ) {
          dadosFiltrados.museologico = declaracao.museologico
        }

        if (
          especialidadeAnalista.includes("arquivistico") &&
          declaracao.arquivistico &&
          Array.isArray(declaracao.arquivistico.analistasResponsaveis) &&
          declaracao.arquivistico.analistasResponsaveis.includes(analistaId)
        ) {
          dadosFiltrados.arquivistico = declaracao.arquivistico
        }

        if (
          especialidadeAnalista.includes("bibliografico") &&
          declaracao.bibliografico &&
          Array.isArray(declaracao.bibliografico.analistasResponsaveis) &&
          declaracao.bibliografico.analistasResponsaveis.includes(analistaId)
        ) {
          dadosFiltrados.bibliografico = declaracao.bibliografico
        }

        // Se o analista não tiver permissão para ver nenhum bem, retorna um erro
        if (Object.keys(dadosFiltrados).length === 0) {
          return res
            .status(404)
            .json({ message: "Nenhum bem encontrado para o analista logado." })
        }

        // Retorna a declaração com os tipos de bens filtrados
        return res.status(200).json(dadosFiltrados)
      }

      // Se não for analista, retorna todos os dados da declaração
      return res.status(200).json(declaracao)
    } catch (error) {
      logger.error("Erro ao buscar declaração:", error)
      return res.status(500).json({ message: "Erro ao buscar declaração." })
    }
  }

  // Retorna todas as declarações do usuário logado
  // Retorna todas as declarações do usuário logado
  // Retorna todas as declarações do usuário logado
  // Retorna todas as declarações do usuário logado
  // Retorna todas as declarações do usuário logado
  async getDeclaracoes(req: Request, res: Response) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(400).json({ message: "Usuário não autenticado." })
      }

      // Buscar usuário com o profile populado
      const user = await Usuario.findById(userId).populate("profile")

      // Verificar se o usuário existe e se o profile foi populado corretamente
      if (!user || !user.profile) {
        return res
          .status(400)
          .json({ message: "Profile do usuário não foi populado." })
      }

      const { id, profile, especialidadeAnalista } = user

      // Verifique se o profile é válido
      if (!profile.name) {
        return res
          .status(400)
          .json({ message: "O profile do usuário não contém nome válido." })
      }

      const match: any = {
        status: { $ne: Status.Excluida },
        ultimaDeclaracao: true
      }

      console.log("Match inicial:", match)

      // Aplique a lógica com base no tipo de profile
      switch (profile.name) {
        case "declarant":
          match.responsavelEnvio = new mongoose.Types.ObjectId(id)
          break

        case "analyst":
          console.log("Especialidades do Analista:", especialidadeAnalista)

          // Para analistas, verifica se o analista está presente em qualquer tipo de bem
          const analistaId = new mongoose.Types.ObjectId(id)
          match.$or = [
            { "museologico.analistasResponsaveis": analistaId },
            { "arquivistico.analistasResponsaveis": analistaId },
            { "bibliografico.analistasResponsaveis": analistaId }
          ]
          break

        case "admin":
          // Administrador tem acesso a todas as declarações
          break

        default:
          return res
            .status(403)
            .json({ message: "Perfil de usuário inválido." })
      }

      console.log("Match Final:", match)

      // Executando a agregação
      const resultado = await Declaracoes.aggregate([
        { $match: match },
        { $sort: { anoDeclaracao: 1, museu_nome: 1, createdAt: -1 } },
        {
          $group: {
            _id: { museu_id: "$museu_id", anoDeclaracao: "$anoDeclaracao" },
            latestDeclaracao: { $first: "$$ROOT" }
          }
        },
        { $replaceRoot: { newRoot: "$latestDeclaracao" } }
      ])

      console.log("Resultado da Agregação:", resultado)

      // Se não houver declarações, informe
      if (resultado.length === 0) {
        console.log("Nenhuma declaração encontrada para os critérios.")
        return res
          .status(404)
          .json({ message: "Nenhuma declaração encontrada." })
      }

      // Filtra as declarações com base nas especialidades do analista
      const declaracoesFiltradas = resultado.map((declaracao: any) => {
        // Mantém apenas os tipos de bens associados à especialidade do analista
        if (especialidadeAnalista.includes("museologico")) {
          // Remove os campos não associados ao tipo museológico
          delete declaracao.arquivistico
          delete declaracao.bibliografico
        }
        if (especialidadeAnalista.includes("arquivistico")) {
          // Remove os campos não associados ao tipo arquivístico
          delete declaracao.museologico
          delete declaracao.bibliografico
        }
        if (especialidadeAnalista.includes("bibliografico")) {
          // Remove os campos não associados ao tipo bibliográfico
          delete declaracao.museologico
          delete declaracao.arquivistico
        }
        return declaracao
      })

      console.log("Declarações Filtradas:", declaracoesFiltradas)

      // Popula o campo "museu_id" com as informações do museu
      const declaracoesComMuseu = await Museu.populate(declaracoesFiltradas, {
        path: "museu_id"
      })

      // Retorna as declarações com o museu populado
      return res.status(200).json(declaracoesComMuseu)
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
      if (error instanceof Error) {
        return res.status(400).json({
          message:
            "Não é possível restaurar esta declaração porque há versões mais recentes de declaração."
        })
      } else {
        return res.status(400).json({ message: "Ocorreu um erro inesperado." })
      }
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
