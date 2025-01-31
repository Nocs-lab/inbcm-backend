import { Status } from "../enums/Status"
import { createHashUpdate } from "../utils/hashUtils"
import {
  Declaracoes,
  Museu,
  Arquivo,
  Arquivistico,
  Bibliografico,
  Museologico,
  DeclaracaoModel,
  Usuario,
  IMuseu,
  TimeLine
} from "../models"
import { IUsuario } from "../models/Usuario"
import mongoose from "mongoose"
import {
  validate_museologico,
  validate_arquivistico,
  validate_bibliografico
} from "inbcm-xlsx-validator"
import { createHash } from "../utils/hashUtils"
import { Profile } from "../models/Profile"
import { DataUtils } from "../utils/dataUtils"
import { Eventos } from "../enums/Eventos"
import logger from "../utils/logger"
import { IAnalista } from "../types/Inalistas"
import { FilterQuery } from "mongoose"

class DeclaracaoService {
  async filtroDeclaracoesDashBoard(
    anos: string[],
    estados: string[],
    cidades: string[],
    museuId: string | null
  ) {
    try {
      const match: any = {}

      if (anos.length > 0) {
        match.anoDeclaracao = { $in: anos }
      }

      if (estados.length > 0 || cidades.length > 0) {
        const museuQuery: any = {}

        if (estados.length > 0) {
          museuQuery["endereco.uf"] = {
            $in: estados.map((estado) => estado.toUpperCase())
          }
        }

        if (cidades.length > 0) {
          museuQuery["endereco.municipio"] = { $in: cidades }
        }

        // Busca IDs dos museus que atendem aos critérios
        const museus = await Museu.find(museuQuery).select("_id").lean()
        const museuIds = museus.map((museu) => museu._id)

        // Adiciona os IDs dos museus encontrados ao filtro
        match.museu_id = { $in: museuIds }
      }

      // Filtro por museu (caso seja enviado)
      if (museuId) {
        match.museu_id = museuId
      }

      // Filtro por "ultimaDeclaracao" sendo true e "status" diferente de 'Excluída'
      match.ultimaDeclaracao = true
      match.status = { $ne: "Excluída" }

      // Agregação para buscar declarações com os filtros aplicados
      const declaracoes = await Declaracoes.aggregate([
        { $match: match },
        {
          $project: {
            _id: 1,
            museu_id: 1,
            museu_nome: 1,
            anoDeclaracao: 1,
            responsavelEnvioNome: 1,
            status: 1,
            arquivistico: 1,
            bibliografico: 1,
            museologico: 1,
            totalItensDeclarados: 1,
            ultimaDeclaracao: 1
          }
        }
      ])

      // Chamando os métodos para poder construir o json
      const cards = await this.showCards(declaracoes)
      const quantidadePorEstadoERegiao =
        await this.quantidadeDeclaracoesPorEstadoERegiao(declaracoes)
      const quantidadeDeclaracoesPorAno =
        await this.quantidadeDeclaracoesPorAnoEStatus(declaracoes, anos)

      // Retornando apenas os dados dos métodos chamados
      return {
        cards,
        quantidadePorEstadoERegiao,
        quantidadeDeclaracoesPorAno
      }
    } catch (error) {
      throw new Error(`Erro ao filtrar declarações para o dashboard: `)
    }
  }

  async showCards(declaracoes: any[]) {
    // Contagem do total de declarações
    const totalDeclaracoes = declaracoes.length

    // Contagem de museus distintos (baseado no campo "museu_id")
    const museusDistintos = new Set()

    // Adiciona o museu_id de cada declaração ao Set (convertendo para string para evitar duplicatas)
    declaracoes.forEach((declaracao) => {
      const museuIdString = declaracao.museu_id.toString()
      museusDistintos.add(museuIdString)
    })

    // O número de museus distintos é o tamanho do Set
    const totalMuseus = museusDistintos.size

    // Inicializa o contador para cada status (ignorar "Excluída")
    const statusCounts: Record<string, number> = {
      [Status.EmConformidade]: 0,
      [Status.EmAnalise]: 0,
      [Status.NaoConformidade]: 0,
      [Status.Recebida]: 0
    }

    // Contabiliza o número de ocorrências de cada status
    declaracoes.forEach((declaracao) => {
      if (declaracao.status !== Status.Excluida) {
        statusCounts[declaracao.status] =
          (statusCounts[declaracao.status] || 0) + 1
      }
    })

    // Calcula o percentual de cada status
    const statusPercentages: Record<string, string> = {}
    Object.keys(statusCounts).forEach((status) => {
      const count = statusCounts[status]
      const percentage = totalDeclaracoes > 0 ? count : 0
      statusPercentages[status] = `${percentage}` // Formata para 2 casas decimais
    })

    // Contagem de itens de cada tipo de bem
    const tipoBemCounts: Record<string, number> = {
      museologico: 0,
      arquivistico: 0,
      bibliografico: 0
    }

    // Soma a quantidade de itens por tipo de bem
    declaracoes.forEach((declaracao) => {
      if (declaracao.arquivistico?.quantidadeItens) {
        tipoBemCounts.arquivistico += declaracao.arquivistico.quantidadeItens
      }
      if (declaracao.bibliografico?.quantidadeItens) {
        tipoBemCounts.bibliografico += declaracao.bibliografico.quantidadeItens
      }
      if (declaracao.museologico?.quantidadeItens) {
        tipoBemCounts.museologico += declaracao.museologico.quantidadeItens
      }
    })

    return {
      totalDeclaracoes,
      totalMuseus,
      statusPercentages,
      quantidadeDeBens: tipoBemCounts
    }
  }

  async quantidadeDeclaracoesPorEstadoERegiao(declaracoes: any[]): Promise<{
    quantidadePorEstado: Record<string, number>
    quantidadePorRegiao: Record<string, number>
    statusPorRegiao: Record<string, Record<string, number>>
  }> {
    try {
      // Inicializa os objetos para contagem por estado, por região e status por região
      const quantidadePorEstado: Record<string, number> = {}
      const quantidadePorRegiao: Record<string, number> = {}
      const statusPorRegiao: Record<string, Record<string, number>> = {}

      // Mapeamento de estados para regiões
      const regioesMap: { [key: string]: string[] } = {
        norte: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
        nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
        "centro-oeste": ["GO", "MT", "MS", "DF"],
        sudeste: ["ES", "MG", "RJ", "SP"],
        sul: ["PR", "RS", "SC"]
      }

      // Itera sobre as declarações
      for (const declaracao of declaracoes) {
        // Busca o museu relacionado usando o ID do museu na declaração
        const museu = await Museu.findById(declaracao.museu_id).select(
          "endereco.uf"
        )

        // Verifica se o museu e o estado estão disponíveis
        if (museu && museu.endereco?.uf) {
          const estado = museu.endereco.uf
          const status = declaracao.status

          // Quantidade por estado
          quantidadePorEstado[estado] = (quantidadePorEstado[estado] || 0) + 1

          // Quantidade por região e status por região
          for (const [regiao, estados] of Object.entries(regioesMap)) {
            if (estados.includes(estado)) {
              // Incrementa a contagem por região
              quantidadePorRegiao[regiao] =
                (quantidadePorRegiao[regiao] || 0) + 1

              // Inicializa o objeto de status para a região, se necessário
              if (!statusPorRegiao[regiao]) {
                statusPorRegiao[regiao] = {}
              }

              // Incrementa o contador do status na região
              statusPorRegiao[regiao][status] =
                (statusPorRegiao[regiao][status] || 0) + 1

              break
            }
          }
        }
      }

      // Retorna o JSON com as contagens
      return {
        quantidadePorEstado,
        quantidadePorRegiao,
        statusPorRegiao
      }
    } catch (error) {
      throw new Error(
        `Erro ao calcular a quantidade de declarações por estado, região e status: `
      )
    }
  }

  async quantidadeDeclaracoesPorAnoEStatus(declaracoes: any[], anos: string[]) {
    try {
      // Inicializa o objeto para contagem
      const declaracoesPorAno: Record<string, number> = {}
      const statusPorAno: Record<string, Record<string, number>> = {}

      // Inicializa os anos com contagem zerada
      anos.forEach((ano) => {
        declaracoesPorAno[ano] = 0
        statusPorAno[ano] = {} // Inicializa o objeto para status por ano
      })

      // Conta as declarações por ano e status
      declaracoes.forEach((declaracao) => {
        const ano = declaracao.anoDeclaracao
        const status = declaracao.status

        // Incrementa a contagem para o ano
        if (anos.includes(ano)) {
          declaracoesPorAno[ano] = (declaracoesPorAno[ano] || 0) + 1

          // Incrementa a contagem para o status dentro do ano
          if (!statusPorAno[ano][status]) {
            statusPorAno[ano][status] = 0
          }
          statusPorAno[ano][status] += 1
        }
      })

      // Retorna o JSON com os dados de declarações por ano e status por ano
      return {
        quantidadePorAno: declaracoesPorAno,
        statusPorAno
      }
    } catch (error) {
      throw new Error(
        `Erro ao calcular a quantidade de declarações por ano e status: `
      )
    }
  }

  async getDashboardData(
    estados: string[],
    anos: string[],
    museuId: string | null,
    cidades: string[] // Novo parâmetro para cidades
  ) {
    const result = (
      await Declaracoes.aggregate([
        {
          $match: {
            status: { $ne: "Excluída" }, // Filtra pelo status
            anoDeclaracao: { $in: anos }, // Filtra pelos anos passados no array
            ultimaDeclaracao: true,
            ...(museuId && {
              museu_id: new mongoose.Types.ObjectId(museuId) // Adiciona o filtro de museuId quando presente
            })
          }
        },
        {
          $lookup: {
            from: "museus",
            localField: "museu_id",
            foreignField: "_id",
            as: "museu"
          }
        },
        {
          $unwind: "$museu"
        },
        ...(estados.length
          ? [
              {
                $match: {
                  "museu.endereco.uf": { $in: estados } // Filtro por estado
                }
              }
            ]
          : []),
        ...(cidades.length
          ? [
              {
                $match: {
                  "museu.endereco.municipio": { $in: cidades } // Filtro por cidade
                }
              }
            ]
          : []),
        {
          $facet: {
            declaracoesPorAnoDashboard: [
              {
                $group: {
                  _id: "$anoDeclaracao",
                  count: { $sum: 1 }
                }
              },
              {
                $sort: { _id: 1 } // Ordenar por ano, se necessário
              }
            ],
            declaracoesPorStatusPorAno: [
              {
                $match: { status: { $ne: "Excluída" } }
              },
              {
                $group: {
                  _id: {
                    status: "$status",
                    ano: "$anoDeclaracao"
                  },
                  count: { $sum: 1 }
                }
              },
              {
                $project: {
                  _id: 0,
                  status: "$_id.status",
                  ano: "$_id.ano",
                  count: "$count"
                }
              }
            ],
            declaracoesPorUFs: [
              {
                $group: {
                  _id: "$museu.endereco.uf",
                  count: { $sum: 1 }
                }
              },
              {
                $project: {
                  _id: 0,
                  uf: "$_id",
                  count: "$count"
                }
              }
            ],
            declaracoesPorRegiao: [
              {
                $match: {
                  anoDeclaracao: { $in: anos }
                }
              },
              {
                $lookup: {
                  from: "museus",
                  localField: "museu_id",
                  foreignField: "_id",
                  as: "museu"
                }
              },
              {
                $unwind: "$museu"
              },
              {
                $group: {
                  _id: {
                    regiao: {
                      $switch: {
                        branches: [
                          {
                            case: {
                              $in: [
                                "$museu.endereco.uf",
                                ["AC", "AP", "AM", "PA", "RO", "RR", "TO"]
                              ]
                            },
                            then: "Norte"
                          },
                          {
                            case: {
                              $in: [
                                "$museu.endereco.uf",
                                [
                                  "AL",
                                  "BA",
                                  "CE",
                                  "MA",
                                  "PB",
                                  "PE",
                                  "PI",
                                  "RN",
                                  "SE"
                                ]
                              ]
                            },
                            then: "Nordeste"
                          },
                          {
                            case: {
                              $in: [
                                "$museu.endereco.uf",
                                ["DF", "GO", "MT", "MS"]
                              ]
                            },
                            then: "Centro-Oeste"
                          },
                          {
                            case: {
                              $in: [
                                "$museu.endereco.uf",
                                ["ES", "MG", "RJ", "SP"]
                              ]
                            },
                            then: "Sudeste"
                          },
                          {
                            case: {
                              $in: ["$museu.endereco.uf", ["PR", "RS", "SC"]]
                            },
                            then: "Sul"
                          }
                        ],
                        default: "Desconhecida"
                      }
                    },
                    status: "$status"
                  },
                  count: { $sum: 1 }
                }
              },
              {
                $project: {
                  _id: 0,
                  regiao: "$_id.regiao",
                  status: "$_id.status",
                  count: "$count"
                }
              }
            ],
            declaracoesAgrupadasPorAnalista: [
              {
                $match: {
                  anoDeclaracao: { $in: anos },
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
            ],
            declaracoesCount: [
              {
                $match: {
                  anoDeclaracao: { $in: anos }
                }
              },
              {
                $count: "count"
              }
            ],
            declaracoesEmConformidade: [
              {
                $match: {
                  anoDeclaracao: { $in: anos },
                  status: Status.EmConformidade
                }
              },
              {
                $count: "count"
              }
            ],
            bensCountPorTipo: [
              {
                $match: {
                  anoDeclaracao: { $in: anos },
                  ...{
                    ...(museuId && {
                      museu_id: new mongoose.Types.ObjectId(museuId)
                    })
                  }
                }
              },
              {
                $group: {
                  _id: null,
                  museologico: { $sum: "$museologico.quantidadeItens" },
                  bibliografico: { $sum: "$bibliografico.quantidadeItens" },
                  arquivistico: { $sum: "$arquivistico.quantidadeItens" }
                }
              },
              {
                $project: {
                  _id: 0
                }
              }
            ],
            bensCountTotal: [
              {
                $match: {
                  anoDeclaracao: { $in: anos }
                }
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: {
                      $sum: [
                        "$museologico.quantidadeItens",
                        "$bibliografico.quantidadeItens",
                        "$arquivistico.quantidadeItens"
                      ]
                    }
                  }
                }
              },
              {
                $project: {
                  _id: 0
                }
              }
            ]
          }
        }
      ])
    )[0] as { [key: string]: { [key: string]: string | number }[] }

    const declaracoesPorStatusPorAno = result.declaracoesPorStatusPorAno
      .map((item) => item.ano)
      .filter((value, index, self) => self.indexOf(value) === index)

    const statusEnum = Declaracoes.schema.path("status")
    const status = Object.values(statusEnum)[0].filter(
      (s: string) => s !== "Excluída"
    )

    const regioes: string[] = [
      "Norte",
      "Nordeste",
      "Centro-Oeste",
      "Sudeste",
      "Sul"
    ]

    return {
      status,
      declaracoesPorAnoDashboard: result.declaracoesPorAnoDashboard.reduce(
        (acc, item) => {
          acc[item._id] = item.count
          return acc
        },
        {}
      ),
      declaracoesPorStatusPorAno: declaracoesPorStatusPorAno.map((ano) => {
        const statusCount = status.reduce((acc: number[], item: number) => {
          const statusItem = result.declaracoesPorStatusPorAno.find(
            (resultItem) => resultItem.ano === ano && resultItem.status === item
          )
          acc.push(statusItem ? (statusItem.count as number) : 0)
          return acc
        }, [])

        const total = statusCount.reduce(
          (acc: number, item: number) => acc + item,
          0
        )

        return [ano, total, ...statusCount]
      }),
      declaracoesPorUFs: result.declaracoesPorUFs.reduce((acc, item) => {
        acc[item.uf] = item.count
        return acc
      }, {}),
      declaracoesPorRegiao: regioes.map((regiao) => {
        const regiaoStatus = result.declaracoesPorRegiao
          .filter((item) => item.regiao === regiao)
          .reduce((acc, item) => {
            acc[item.status] = item.count
            return acc
          }, {})

        const total = (Object.values(regiaoStatus) as number[]).reduce(
          (acc: number, item: number) => acc + item,
          0
        )

        const statusCount = status.reduce((acc: number[], item: number) => {
          acc.push((regiaoStatus[item] as number) || 0)
          return acc
        }, [])

        return [regiao, total, ...statusCount]
      }),
      declaracoesAgrupadasPorAnalista: result.declaracoesAgrupadasPorAnalista,
      declaracoesCount: result.declaracoesCount[0]?.count || 0,
      declaracoesEmConformidade:
        result.declaracoesEmConformidade[0]?.count || 0,
      bensCountPorTipo: result.bensCountPorTipo[0] || {
        museologico: 0,
        bibliografico: 0,
        arquivistico: 0
      },
      bensCountTotal: result.bensCountTotal[0]?.total || 0
    }
  }

  async declaracaoComFiltros({
    anoReferencia,
    status,
    nomeMuseu,
    dataInicio,
    dataFim,
    regiao,
    uf,
    ultimaDeclaracao = true
  }: {
    anoReferencia: string
    status: string
    nomeMuseu: string
    dataInicio: number
    dataFim: number
    regiao: string
    uf: string
    ultimaDeclaracao: boolean
  }) {
    try {
      let query = Declaracoes.find()

      if (ultimaDeclaracao || ultimaDeclaracao == null) {
        query = query.where({
          $or: [{ ultimaDeclaracao: true }, { status: "Excluída" }]
        })
      }

      //Lógica para extrair os tipos de status do model e verificar se foi enviado um status válido para filtrar
      const statusEnum = Declaracoes.schema.path("status")
      const statusArray = Object.values(statusEnum)[0]
      const statusExistente = statusArray.includes(status)
      const statusCount: Record<string, number> = {}
      if (statusExistente) {
        query = query.where("status").equals(status)
      } else {
        // Cria os campos de count atribuindo 0 para cada status em statusCount
        statusArray.forEach((statusItem: string) => {
          statusCount[statusItem] = 0
        })
      }

      // Filtro para UF
      if (uf) {
        const museus = await Museu.find({ "endereco.uf": uf })
        const museuIds = museus.map((museu) => museu._id)
        query = query.where("museu_id").in(museuIds)
      }

      // Definindo o mapeamento de regiões para UFs
      const regioesMap: { [key: string]: string[] } = {
        norte: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
        nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
        "centro-oeste": ["GO", "MT", "MS", "DF"],
        sudeste: ["ES", "MG", "RJ", "SP"],
        sul: ["PR", "RS", "SC"]
      }
      // Filtro por cada região
      if (regiao) {
        const lowerCaseRegiao = regiao.toLowerCase()
        if (lowerCaseRegiao in regioesMap) {
          const ufs = regioesMap[lowerCaseRegiao]
          const museus = await Museu.find({ "endereco.uf": { $in: ufs } })
          const museuIds = museus.map((museu) => museu._id)
          query = query.where("museu_id").in(museuIds)
        }
      }

      //Filtro para ano da declaração
      if (anoReferencia) {
        query = query.where("anoDeclaracao").equals(anoReferencia)
      }

      //Filtro por data
      if (dataInicio && dataFim) {
        const endDate = new Date(dataFim)
        endDate.setHours(23, 59, 59, 999) // Definir o final do dia para a data de fim

        query = query.where("dataCriacao").gte(dataInicio).lte(dataFim)
      }

      //Filtro para o nome do museu
      if (nomeMuseu) {
        const museus = await Museu.find({ nome: nomeMuseu })
        const museuIds = museus.map((museu) => museu._id)
        query = query.where("museu_id").in(museuIds)
      }
      const result = await query
        .populate([{ path: "museu_id", model: Museu, select: [""] }])
        .sort("-dataCriacao")
        .exec()

      let [bemCount, museologicoCount, bibliograficoCount, arquivisticoCount] =
        [0, 0, 0, 0]

      const data = result.map((d) => {
        const data = d.toJSON()
        // @ts-expect-error - O campo museu_id é um objeto, não uma string
        data.museu_id.endereco.regiao =
          // @ts-expect-error - O campo museu_id é um objeto, não uma string
          regioesMap[data.museu_id.endereco.uf as keyof typeof regioesMap]
        if (!statusExistente && data.status in statusCount) {
          statusCount[data.status] += 1
        }
        // Adicionando contagem dos bens
        if (data.museologico) {
          museologicoCount += data.museologico.quantidadeItens || 0
        }
        if (data.bibliografico) {
          bibliograficoCount += data.bibliografico.quantidadeItens || 0
        }
        if (data.arquivistico) {
          arquivisticoCount += data.arquivistico.quantidadeItens || 0
        }
        bemCount +=
          (data.museologico?.quantidadeItens || 0) +
          (data.bibliografico?.quantidadeItens || 0) +
          (data.arquivistico?.quantidadeItens || 0)
        return data
      })

      return {
        declaracaoCount: data.length,
        statusCount,
        bemCount,
        museologicoCount,
        bibliograficoCount,
        arquivisticoCount,
        data
      }
    } catch (error) {
      throw new Error("Erro ao buscar declarações com filtros.")
    }
  }

  async verificarDeclaracaoExistente(museu: string, anoDeclaracao: string) {
    const declaracaoExistente = await Declaracoes.findOne({
      anoDeclaracao,
      museu_id: museu,
      status: { $ne: Status.Excluida },
      ultimaDeclaracao: true
    })

    return declaracaoExistente
  }

  /**
   * Processa e atualiza um tipo específico de bem (arquivístico, bibliográfico ou museológico) em uma declaração.
   *
   * @param anoDeclaracao - ano de criacao da declaracao.
   * @param responsavelEnvio  - usuario logado responsavel pelo envio da declaracao
   * @param museu_id - id do museu o qual deseja-se criar uma declaracao.
   * @param muse_nome - nome do museu o qual deseja-se criar uma declaracao
   *
   * @returns retorna uma nova declaracao ou um erro ao tentar criar uma declaracao
   */
  async criarDadosDeclaracao(
    museu: IMuseu,
    responsavelEnvio: mongoose.Types.ObjectId | string,
    anoDeclaracao: string,
    declaracaoExistente: DeclaracaoModel | null,
    novaVersao: number,
    salt: string,
    dataRecebimento: Date,
    responsavelEnvioNome: string
  ) {
    return declaracaoExistente
      ? {
          museu_id: declaracaoExistente.museu_id,
          museu_nome: declaracaoExistente.museu_nome,
          anoDeclaracao: declaracaoExistente.anoDeclaracao,
          responsavelEnvio: declaracaoExistente.responsavelEnvio,
          responsavelEnvioNome: declaracaoExistente.responsavelEnvioNome,
          totalItensDeclarados: declaracaoExistente.totalItensDeclarados,
          status: declaracaoExistente.status,
          retificacao: true,
          retificacaoRef: declaracaoExistente._id as mongoose.Types.ObjectId,
          versao: novaVersao,
          hashDeclaracao: createHash(
            declaracaoExistente._id as mongoose.Types.ObjectId,
            salt
          ),
          dataRecebimento: dataRecebimento
        }
      : {
          anoDeclaracao,
          museu_id: museu._id,
          museu_nome: museu.nome,
          responsavelEnvio: responsavelEnvio,
          responsavelEnvioNome: responsavelEnvioNome,
          retificacao: false,
          versao: novaVersao,
          status: Status.Recebida,
          hashDeclaracao: createHash(new mongoose.Types.ObjectId(), salt),
          dataRecebimento: dataRecebimento
        }
  }

  /**
   * Processa e atualiza o histórico da declaração de um tipo específico de bem (arquivístico, bibliográfico ou museológico) em uma declaração.
   *
   * @param arquivos - Lista de arquivos enviados (pode ser indefinida).
   * @param dados - String JSON contendo os dados do bem.
   * @param erros - String JSON contendo os erros relacionados ao bem.
   * @param declaracao - A declaração que está sendo atualizada.
   * @param tipo - O tipo de bem a ser processado ("arquivistico", "bibliografico" ou "museologico").
   *
   * @returns Uma promessa que resolve quando o processamento e a atualização são concluídos com sucesso.
   */
  async updateDeclaracao(
    arquivos: Express.Multer.File[] | undefined,
    novaDeclaracao: DeclaracaoModel,
    tipo: "arquivistico" | "bibliografico" | "museologico",
    arquivoAnterior: Arquivo | null,
    novaVersao: number,
    responsavelEnvioNome: string
  ) {
    try {
      if (arquivos && arquivos.length > 0) {
        const novoHashBemCultural = createHashUpdate(
          arquivos[0].path,
          arquivos[0].filename
        )

        let validate = validate_arquivistico
        if (tipo === "bibliografico") {
          validate = validate_bibliografico
        } else if (tipo === "museologico") {
          validate = validate_museologico
        }

        const { data: arquivoData, errors: pendencias } = await validate(
          arquivos[0].buffer
        )

        const dadosAlterados: Partial<Arquivo> = {
          nome: arquivos[0].filename,
          status: novaDeclaracao.status,
          hashArquivo: novoHashBemCultural,
          pendencias,
          quantidadeItens: arquivoData.length,
          versao: novaVersao
        }
        novaDeclaracao[tipo] = {
          ...arquivoAnterior,
          ...dadosAlterados
        } as Arquivo

        arquivoData.forEach((item: { [key: string]: unknown }) => {
          item.declaracao_ref = novaDeclaracao._id
          item.versao = novaVersao
        })

        let Modelo
        switch (tipo) {
          case "arquivistico":
            Modelo = Arquivistico
            break
          case "bibliografico":
            Modelo = Bibliografico
            break
          case "museologico":
            Modelo = Museologico
            break
          default:
            throw new Error("Tipo de declaração inválido")
        }

        await Modelo.insertMany(arquivoData)
      } else if (arquivoAnterior) {
        novaDeclaracao[tipo] = { ...arquivoAnterior } as Arquivo
      }

      if (novaDeclaracao.retificacaoRef) {
        const declaracaoAnterior = (await Declaracoes.findById(
          novaDeclaracao.retificacaoRef
        ).exec()) as DeclaracaoModel | null

        if (declaracaoAnterior) {
          novaDeclaracao.retificacaoRef =
            declaracaoAnterior._id as mongoose.Types.ObjectId
          novaDeclaracao.retificacao = true
        }
      }
      novaDeclaracao.responsavelEnvioNome = responsavelEnvioNome
      await novaDeclaracao.save()
    } catch (error) {
      console.error("Erro ao atualizar a declaração:", error)
      throw new Error("Erro ao atualizar a declaração: " + error)
    }
  }
  async getItensMuseu(museuId: string) {
    const declaracoesExistentes = await Declaracoes.find({
      museu_id: new mongoose.Types.ObjectId(museuId),
      ultimaDeclaracao: true
    })

    if (declaracoesExistentes.length === 0) {
      throw new Error(`Nenhuma declaração encontrada para o museu ${museuId}`)
    }

    const agregacao = await Declaracoes.aggregate([
      {
        $match: {
          museu_id: new mongoose.Types.ObjectId(museuId),
          ultimaDeclaracao: true
        }
      },
      {
        $group: {
          _id: "$anoDeclaracao",
          totalArquivistico: {
            $sum: { $ifNull: ["$arquivistico.quantidadeItens", 0] }
          },
          totalBibliografico: {
            $sum: { $ifNull: ["$bibliografico.quantidadeItens", 0] }
          },
          totalMuseologico: {
            $sum: { $ifNull: ["$museologico.quantidadeItens", 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          anoDeclaracao: "$_id",
          totalArquivistico: 1,
          totalBibliografico: 1,
          totalMuseologico: 1,
          totalDeItensDeclaracao: {
            $add: [
              "$totalArquivistico",
              "$totalBibliografico",
              "$totalMuseologico"
            ]
          }
        }
      },
      { $sort: { anoDeclaracao: 1 } }
    ])

    return agregacao
  }
  /**
   * Método  para alterar o analista vinculado a uma declaração.
   *
   * @param declaracaoId - O ID da declaração que terá o analista alterado
   * @param analistaId - O ID do novo analista a ser vinculado à declaração
   * @returns Um objeto com a mensagem de sucesso ou um erro caso algo dê errado
   */
  async alterarAnalistaArquivo(
    declaracaoId: string,
    arquivoTipo: "arquivistico" | "bibliografico" | "museologico",
    analistaId: string,
    autorId: string
  ) {
    const objectId = new mongoose.Types.ObjectId(declaracaoId)
    const declaracao = await Declaracoes.findById(objectId)

    if (!declaracao) {
      throw new Error("Declaração não encontrada.")
    }

    // Verifica se o analista existe
    const analista = await Usuario.findById(analistaId)

    if (!analista) {
      throw new Error("Analista não encontrado.")
    }

    // Verifica quem realizou a alteração (autor)
    const autor = await Usuario.findById(autorId)

    if (!autor) {
      throw new Error("Autor da alteração não encontrado.")
    }

    const arquivo = declaracao[arquivoTipo]
    if (!arquivo) {
      throw new Error(
        `Arquivo do tipo ${arquivoTipo} não está presente na declaração.`
      )
    }

    // Atualiza os analistas responsáveis
    const analistaAnterior = arquivo.analistasResponsaveisNome?.[0] || "N/A"
    logger.info(analistaAnterior)
    arquivo.analistasResponsaveis = [new mongoose.Types.ObjectId(analistaId)]
    arquivo.analistasResponsaveisNome = [analista.nome]

    const evento = {
      nomeEvento: "Mudança de analista",
      dataEvento: DataUtils.getCurrentData(),
      autorEvento: autor.nome,
      analistaResponsavel: [analista.nome]
    }

    const declaracaoAtualizada = await this.adicionarEvento(objectId, evento)

    await declaracao.save()

    return {
      message: `Analista vinculado ao arquivo ${arquivoTipo} com sucesso.`,
      arquivo,
      timeLine: declaracaoAtualizada?.timeLine
    }
  }

  async listarAnalistas(
    especificidades?: string[],
    nomeAnalista?: string
  ): Promise<IAnalista[]> {
    try {
      const analistaProfile = await Profile.findOne({ name: "analyst" })
      if (!analistaProfile) {
        throw new Error("Perfil 'analyst' não encontrado.")
      }

      const filtro: FilterQuery<IUsuario> = {
        profile: analistaProfile._id,
        especialidadeAnalista: { $exists: true, $not: { $size: 0 } }
      }

      if (especificidades) {
        filtro.especialidadeAnalista = { $in: especificidades }
      }

      if (nomeAnalista) {
        filtro.nome = { $regex: nomeAnalista, $options: "i" }
      }

      const analistas = await Usuario.find(filtro)
        .select("_id nome email especialidadeAnalista")
        .lean()
        .sort({ nome: 1 })
        .lean()

      return analistas as unknown as IAnalista[]
    } catch (error: unknown) {
      if ((error as { message?: string }).message) {
        throw new Error(
          `Erro ao listar analistas: ${(error as { message: string }).message}`
        )
      } else {
        throw new Error("Erro desconhecido ao listar analistas.")
      }
    }
  }

  /**
   * Envia uma declaração para análise, atribuindo analistas por tipo de arquivo
   * e alterando o status da declaração para Em análise.
   *
   * @param id - O ID da declaração a ser enviada.
   * @param analistasPorTipo - Um objeto contendo os IDs dos analistas por tipo de arquivo
   * (arquivístico, bibliográfico, museológico).
   * @param adminId - O ID do administrador responsável pelo envio.
   * @returns A declaração atualizada com os analistas atribuídos e o status alterado.
   * @throws Lança erros em caso de problemas durante o processo.
   */
  async enviarParaAnalise(
    id: string,
    analistasPorTipo: { [key: string]: string[] },
    adminId: string
  ): Promise<DeclaracaoModel | null> {
    try {
      const objectId = new mongoose.Types.ObjectId(id)

      const declaracao = await Declaracoes.findById(objectId)

      // Verifica se a declaração foi encontrada
      if (!declaracao) {
        throw new Error("Declaração não encontrada.")
      }

      if (
        declaracao.status !== Status.Recebida &&
        declaracao.status !== Status.EmAnalise
      ) {
        logger.warn(
          `Status inválido para envio. Status atual: ${declaracao.status}`
        )
        throw new Error(
          `Declaração não está no estado adequado para envio. Status atual: ${declaracao.status}`
        )
      }

      // Lista de tipos de arquivos que serão processados
      const tiposArquivos = [
        "arquivistico",
        "bibliografico",
        "museologico"
      ] as const

      // Itera sobre os tipos de arquivos para atualizar os analistas responsáveis
      for (const tipo of tiposArquivos) {
        const arquivo = declaracao[tipo] // Obtém o arquivo correspondente ao tipo
        const analistas = analistasPorTipo[tipo] // Obtém os IDs dos analistas para o tipo

        if (arquivo && analistas) {
          // Mapeia os IDs dos analistas para ObjectIds do MongoDB
          arquivo.analistasResponsaveis = analistas.map(
            (id) => new mongoose.Types.ObjectId(id)
          )

          // Busca os nomes dos analistas no banco de dados
          const analistasNomes = await Usuario.find({
            _id: { $in: arquivo.analistasResponsaveis }
          })
            .select("nome")
            .lean()

          // Atribui os nomes dos analistas ao arquivo
          arquivo.analistasResponsaveisNome = analistasNomes.map(
            (analista) => analista.nome
          )
        }
      }

      declaracao.status = Status.EmAnalise

      declaracao.dataEnvioAnalise = DataUtils.getCurrentData()

      declaracao.responsavelEnvioAnalise = new mongoose.Types.ObjectId(adminId)

      const responsavel = await Usuario.findById(adminId).select("nome").lean()
      const responsavelNome = responsavel ? responsavel.nome : "Desconhecido"

      const analistasIds = Object.values(analistasPorTipo).flat()

      const analistasList = await Usuario.find({
        _id: { $in: analistasIds }
      })
        .select("nome _id")
        .lean()

      const responsavelReporte: TimeLine = {
        nomeEvento: `${Eventos.EnvioParaAnalise}:`,
        dataEvento: DataUtils.getCurrentData(),
        autorEvento: responsavelNome,
        analistaResponsavel: Object.values(analistasPorTipo).flatMap((ids) =>
          ids.map((id) => {
            const analistaIndex = analistasList.find(
              (analista) => analista._id.toString() === id
            )
            return analistaIndex ? analistaIndex.nome : "Desconhecido"
          })
        )
      }

      // Adiciona o evento à linha do tempo da declaração
      await this.adicionarEvento(
        declaracao._id as mongoose.Types.ObjectId,
        responsavelReporte
      )

      await declaracao.save({ validateBeforeSave: false })

      const declaracaoPopulada = await Declaracoes.findById(declaracao._id)
        .populate({ path: "responsavelEnvioAnalise", select: "nome" })
        .exec()

      if (!declaracaoPopulada) {
        throw new Error("Erro ao obter a declaração com os nomes.")
      }

      return declaracaoPopulada
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Erro: ${error.message}`)
        throw new Error(error.message)
      } else {
        logger.error(`Erro inesperado: ${JSON.stringify(error)}`)
        throw new Error(
          "Ocorreu um erro inesperado. Por favor, tente novamente."
        )
      }
    }
  }
  /**
   * Atualiza o status dos tipos de bens de uma declaração e adiciona comentários se fornecidos.
   * Faz a verficação necessária para saber se o autorID é admin ou analyst. Caso seja admin,o endpoint para alterar analistas de uma declaração deve ser chamado.
   * @param declaracaoId - O ID da declaração a ser atualizada.
   * @param statusBens - Objeto contendo os status e comentários para cada tipo de bem.
   * @param autorId - O ID do administrador ou analista que está realizando a atualização.
   * @returns Mensagem de sucesso e o objeto atualizado.
   * @throws Erros se a declaração não for encontrada ou ocorrer falha na validação.
   */
  // Método  para atualizar o status de diferentes tipos de bens de uma declaração
  async atualizarStatusBens(
    declaracaoId: string,
    statusBens: Partial<
      Record<
        "museologico" | "arquivistico" | "bibliografico",
        { status: Status; comentario?: string }
      >
    >,
    autorId: string
  ) {
    try {
      // Buscar a declaração
      const declaracao = await Declaracoes.findById(declaracaoId)
      if (!declaracao) {
        throw new Error("Declaração não encontrada.")
      }

      // Buscar o autor e garantir que o campo profile foi populado
      const autor = await Usuario.findById(autorId).populate("profile", "name")
      if (!autor) {
        throw new Error("Autor não encontrado.")
      }

      // Verificar se o perfil está populado e acessar `name`
      const perfilUsuario =
        typeof autor.profile === "object" && "name" in autor.profile
          ? autor.profile.name
          : null

      if (!perfilUsuario) {
        throw new Error("Perfil do usuário não encontrado ou inválido.")
      }

      const tiposVinculados: string[] = []

      // Verificar se o analista está vinculado aos tipos de bem e adicionar aos tiposVinculados
      if (
        declaracao.arquivistico &&
        Array.isArray(declaracao.arquivistico.analistasResponsaveis)
      ) {
        if (
          declaracao.arquivistico.analistasResponsaveis.includes(
            new mongoose.Types.ObjectId(autorId)
          )
        ) {
          tiposVinculados.push("arquivistico")
        }
      }

      if (
        declaracao.bibliografico &&
        Array.isArray(declaracao.bibliografico.analistasResponsaveis)
      ) {
        if (
          declaracao.bibliografico.analistasResponsaveis.includes(
            new mongoose.Types.ObjectId(autorId)
          )
        ) {
          tiposVinculados.push("bibliografico")
        }
      }

      if (
        declaracao.museologico &&
        Array.isArray(declaracao.museologico.analistasResponsaveis)
      ) {
        if (
          declaracao.museologico.analistasResponsaveis.includes(
            new mongoose.Types.ObjectId(autorId)
          )
        ) {
          tiposVinculados.push("museologico")
        }
      }

      // Verificar se o usuário tem permissão para alterar o status com base no perfil
      if (perfilUsuario === "admin") {
        const tiposPermitidos = Object.keys(statusBens) as Array<
          keyof typeof statusBens
        >

        for (const tipo of tiposPermitidos) {
          if (!tiposVinculados.includes(tipo)) {
            throw new Error(
              `Você não tem permissão para alterar o status do tipo ${tipo}, pois não possui tal especificidade ou não está vinculado corretamente a esse tipo.`
            )
          }
        }
      }

      if (perfilUsuario === "analyst") {
        const tiposPermitidos = Object.keys(statusBens) as Array<
          keyof typeof statusBens
        >

        // Verificar se o analista está tentando alterar um tipo ao qual não está vinculado
        for (const tipo of tiposPermitidos) {
          if (!tiposVinculados.includes(tipo)) {
            throw new Error(
              `Você não está vinculado ao tipo ${tipo} e não pode alterar o status desse tipo.`
            )
          }
        }
      }

      for (const [tipo, { status, comentario }] of Object.entries(
        statusBens
      ) as Array<
        [keyof DeclaracaoModel, { status: Status; comentario?: string }]
      >) {
        if (declaracao[tipo]) {
          declaracao[tipo].status = status

          if (comentario) {
            declaracao[tipo].comentarios = declaracao[tipo].comentarios || []
            declaracao[tipo].comentarios.push({
              autor: autorId,
              autorNome: autor.nome,
              mensagem: comentario,
              data: DataUtils.getCurrentData()
            })
          }

          declaracao.timeLine.push({
            nomeEvento: `Alteração de status do tipo ${tipo} para ${status}`,
            dataEvento: DataUtils.getCurrentData(),
            autorEvento: autor.nome,
            analistaResponsavel: [autor.nome]
          })
        }
      }

      // Atualizar status da declaração
      const todosStatus = [
        declaracao.arquivistico?.status,
        declaracao.bibliografico?.status,
        declaracao.museologico?.status
      ].filter(Boolean) // Remove valores undefined caso um tipo não esteja presente

      // Verificar se todos os status dos bens estão definidos como "Em Conformidade" ou "Não Conformidade"
      const todosFinalizados = todosStatus.every(
        (status) =>
          status === Status.EmConformidade || status === Status.NaoConformidade
      )

      // Atualizar o status da declaração
      if (todosFinalizados) {
        // Se todos os bens estiverem "Em Conformidade", a declaração também deve estar "Em Conformidade"
        if (todosStatus.every((status) => status === Status.EmConformidade)) {
          declaracao.status = Status.EmConformidade
          declaracao.dataFimAnalise = DataUtils.getCurrentData()
        } else {
          // Caso contrário, a declaração deve ser "Não Conformidade" se houver algum bem "Não Conformidade"
          declaracao.status = Status.NaoConformidade
          declaracao.dataFimAnalise = DataUtils.getCurrentData()
        }
      } else {
        // Se ainda houver bens pendentes, manter a declaração "Em Análise"
        declaracao.status = Status.EmAnalise
      }

      await declaracao.save()

      return {
        message: "Status dos bens atualizado com sucesso.",
        declaracao
      }
    } catch (error) {
      console.error("Erro ao atualizar status dos bens:", error)
      throw new Error("Erro inesperado ao atualizar o status.")
    }
  }

  /**
   * Restaura uma declaração para o status 'Recebida' quando ela está com status 'Excluída'.
   * Verifica se há versões mais recentes da declaração que não estão com status 'Excluída'
   * antes de permitir a restauração.
   *
   * @param declaracaoId - ID da declaração que será restaurada
   * @returns Um objeto com a mensagem de sucesso ou erro
   * @throws Error caso a declaração não possa ser restaurada
   */
  async restauraDeclaracao(declaracaoId: string) {
    const objectId = new mongoose.Types.ObjectId(declaracaoId)
    const declaracao = await Declaracoes.findById(objectId)

    if (!declaracao) {
      throw new Error("Declaração não encontrada.")
    }

    // Verifica se o status da declaração é 'Excluída'
    if (declaracao.status !== Status.Excluida) {
      throw new Error(
        "Somente declarações com status 'Excluída' podem ser restauradas para 'Recebida'."
      )
    }

    const declaracoesMaisNovas = await Declaracoes.find({
      museu_id: declaracao.museu_id,
      anoDeclaracao: declaracao.anoDeclaracao,
      versao: { $gt: declaracao.versao }
    }).lean()

    const existeVersaoNaoExcluida = declaracoesMaisNovas.some(
      (decl) => decl.status !== Status.Excluida
    )

    if (existeVersaoNaoExcluida) {
      throw new Error(
        "Não é possível restaurar esta declaração porque há versões mais recentes de declaração para esse museu e ano correspondente."
      )
    }

    declaracao.status = Status.Recebida

    await declaracao.save()

    return {
      message: "Declaração restaurada com sucesso para 'Recebida'.",
      declaracao
    }
  }

  async listarAnalistasPorEspecificidades(
    especificidades: string[]
  ): Promise<IUsuario[]> {
    const analistas = await Usuario.find<IUsuario>({
      especialidadeAnalista: { $in: especificidades }
    })
      .select("nome especialidadeAnalista")
      .lean<IUsuario[]>()

    return analistas
  }

  async getItensPorAnoETipo(
    museuId: string,
    anoInicio: number,
    anoFim: number
  ) {
    const declaracoesExistentes = await Declaracoes.find({
      museu_id: new mongoose.Types.ObjectId(museuId),
      anoDeclaracao: { $gte: anoInicio.toString(), $lte: anoFim.toString() },
      ultimaDeclaracao: true,
      status: { $ne: Status.Excluida }
    })

    if (declaracoesExistentes.length === 0) {
      throw new Error(
        `Nenhuma declaração encontrada para o museu ${museuId} entre ${anoInicio} e ${anoFim}`
      )
    }

    const agregacao = await Declaracoes.aggregate([
      {
        $match: {
          museu_id: new mongoose.Types.ObjectId(museuId),
          anoDeclaracao: {
            $gte: anoInicio.toString(),
            $lte: anoFim.toString()
          },
          ultimaDeclaracao: true,
          isExcluded: { $ne: true }
        }
      },
      {
        $group: {
          _id: "$anoDeclaracao",
          totalArquivistico: {
            $sum: { $ifNull: ["$arquivistico.quantidadeItens", 0] }
          },
          totalBibliografico: {
            $sum: { $ifNull: ["$bibliografico.quantidadeItens", 0] }
          },
          totalMuseologico: {
            $sum: { $ifNull: ["$museologico.quantidadeItens", 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          anoDeclaracao: "$_id",
          totalArquivistico: 1,
          totalBibliografico: 1,
          totalMuseologico: 1,
          totalDeItensDeclaracao: {
            $add: [
              "$totalArquivistico",
              "$totalBibliografico",
              "$totalMuseologico"
            ]
          }
        }
      },
      { $sort: { anoDeclaracao: 1 } }
    ])

    return agregacao
  }

  async concluirAnalise(id: string, status: Status): Promise<DeclaracaoModel> {
    const declaracaoId = new mongoose.Types.ObjectId(id)
    const declaracao = await Declaracoes.findById(declaracaoId)

    if (!declaracao) {
      throw new Error("Declaração não encontrada.")
    }

    if (![Status.EmConformidade, Status.NaoConformidade].includes(status)) {
      throw new Error("Status inválido.")
    }

    const eventoTimeLine: TimeLine = {
      nomeEvento: `${Eventos.ConclusaoAnalise} : ${status === Status.EmConformidade ? "Em Conformidade" : "Não Conformidade"}`,
      dataEvento: DataUtils.getCurrentData()
    }

    await this.adicionarEvento(
      declaracao._id as mongoose.Types.ObjectId,
      eventoTimeLine
    )

    const declaracaoAtualizada = await Declaracoes.findById(declaracaoId).exec()

    if (!declaracaoAtualizada) {
      throw new Error(
        "Erro ao atualizar a declaração com o evento da timeline."
      )
    }

    return declaracaoAtualizada
  }

  /**
   * Processa e atualiza o histórico da declaração de um tipo específico de bem (arquivístico, bibliográfico ou museológico) em uma declaração.
   *
   * @param museuId - String  contendo um  id de museu.
   * @param ano - String contendo um ano de declaracao.
   * @param userId - String  contendo id de usuario
   * @param tipoItem - String contenado  tipo de bem a ser buscado ("Arquivistico", "Bibliografico" ou "Museologico").
   *
   *
   * @returns Uma promessa que resolve uma listagem de itens de um determinado tipo de bem.
   */
  async buscarItensPorTipo(
    museuId: string,
    ano: string,
    userId: string,
    tipoItem: string
  ) {
    // Verificar se o museu pertence ao usuário específico
    const museu = await Museu.findOne({ _id: museuId, usuario: userId })

    if (!museu) {
      throw new Error("Museu inválido ou você não tem permissão para acessá-lo")
    }

    // Definir o modelo e os campos de projeção com base no tipo de item
    let Model: typeof Arquivistico | typeof Bibliografico | typeof Museologico
    let retornoPorItem: string

    switch (tipoItem) {
      case "arquivistico":
        Model = Arquivistico
        retornoPorItem = "_id coddereferencia titulo nomedoprodutor" // Defina os campos específicos para arquivistico
        break
      case "bibliografico":
        Model = Bibliografico
        retornoPorItem = "_id nderegistro situacao titulo localdeproducao" // Defina os campos específicos para bibliografico
        break
      case "museologico":
        Model = Museologico
        retornoPorItem = "_id nderegistro autor situacao denominacao" // Defina os campos específicos para museologico
        break
      default:
        throw new Error("Tipo de item inválido")
    }

    // Primeira agregação: encontrar a maior versão
    const maxVersaoResult = await Model.aggregate([
      {
        $lookup: {
          from: "declaracoes",
          localField: "declaracao_ref",
          foreignField: "_id",
          as: "declaracoes"
        }
      },
      {
        $unwind: "$declaracoes"
      },
      {
        $match: {
          "declaracoes.museu_id": new mongoose.Types.ObjectId(museuId),
          "declaracoes.anoDeclaracao": ano,
          "declaracoes.responsavelEnvio": new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: null,
          maxVersao: { $max: "$versao" }
        }
      }
    ])

    const maxVersao = maxVersaoResult[0]?.maxVersao

    if (maxVersao === undefined) {
      return [] // Se não houver versão encontrada, retornar array vazio
    }

    // Segunda agregação: buscar os itens do tipo especificado da maior versão encontrada
    const result = await Model.find({
      versao: maxVersao,
      declaracao_ref: {
        $in: await Declaracoes.find({
          museu_id: new mongoose.Types.ObjectId(museuId),
          anoDeclaracao: ano,
          responsavelEnvio: new mongoose.Types.ObjectId(userId)
        }).select("_id")
      }
    }).select(retornoPorItem)

    return result
  }
  async adicionarEvento(
    declaracaoId: mongoose.Types.ObjectId,
    evento: TimeLine
  ) {
    return await Declaracoes.findByIdAndUpdate(
      declaracaoId,
      { $push: { timeLine: evento } },
      { new: true }
    ).exec()
  }

  /**
   * Processa e atualiza uma  declaração,fazendo a deleção lógica.
   * @param id - String  contendo um  id de da declaracao.
   */
  async excluirDeclaracao(id: string): Promise<void> {
    const declaracaoId = new mongoose.Types.ObjectId(id)
    const resultado = await Declaracoes.updateOne(
      { _id: declaracaoId, status: Status.Recebida },
      { $set: { status: Status.Excluida } }
    )

    if (resultado.matchedCount === 0) {
      throw new Error(
        "Nenhuma declaração com status 'Recebida' foi encontrada para exclusão."
      )
    }

    const declaracao = await Declaracoes.findById(declaracaoId)
    if (!declaracao) {
      throw new Error("Declaração não encontrada após atualização.")
    }

    declaracao.timeLine.push({
      nomeEvento: Eventos.ExclusaoDeclaracao,
      dataEvento: DataUtils.getCurrentData(),
      autorEvento: declaracao.responsavelEnvioNome
    })

    logger.info(
      "Evento de exclusão adicionado à time-line:",
      declaracao.timeLine
    )
    try {
      declaracao.dataExclusao = DataUtils.getCurrentData()
      await declaracao.save()
      logger.info("Time-line salva com sucesso.")
    } catch (error) {
      logger.error("Erro ao salvar time-line na declaração:", error)
      throw new Error("Falha ao salvar a time-line de exclusão.")
    }
  }
}

export default DeclaracaoService
