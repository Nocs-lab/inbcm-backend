import { Status } from "../enums/Status"
import { createHashUpdate } from "../utils/hashUtils"
import {
  Declaracoes,
  Museu,
  Arquivo,
  Arquivistico,
  Bibliografico,
  Museologico,
  DeclaracaoModel
} from "../models"
import mongoose from "mongoose"
import {
  validate_museologico,
  validate_arquivistico,
  validate_bibliografico
} from "inbcm-xlsx-validator"
import { createHash, generateSalt } from "../utils/hashUtils"
import { StringDecoder } from "string_decoder"
class DeclaracaoService {
  async declaracoesPorStatus() {
    try {
      const result = await Declaracoes.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: "$count"
          }
        }
      ])

      const statusCounts = result.reduce((acc, item) => {
        acc[item.status] = item.count
        return acc
      }, {})

      return statusCounts
    } catch (error) {
      console.error(
        "Erro ao realizar busca de declarações por status para o dashboard:",
        error
      )
      throw new Error(
        "Erro ao realizar busca de declarações por status para o dashboard."
      )
    }
  }

  async declaracoesPorUF() {
    try {
      const result = await Declaracoes.aggregate([
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
      ])

      const ufs = result.reduce((acc, item) => {
        acc[item.uf] = item.count
        return acc
      }, {})

      return ufs
    } catch (error) {
      console.error(
        "Erro ao realizar busca de declarações por UF para o dashboard:",
        error
      )
      throw new Error(
        "Erro ao realizar busca de declarações por UF para o dashboard."
      )
    }
  }

  async declaracoesPorRegiao() {
    try {
      const result = await Declaracoes.aggregate([
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
                          ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"]
                        ]
                      },
                      then: "Nordeste"
                    },
                    {
                      case: {
                        $in: ["$museu.endereco.uf", ["DF", "GO", "MT", "MS"]]
                      },
                      then: "Centro-Oeste"
                    },
                    {
                      case: {
                        $in: ["$museu.endereco.uf", ["ES", "MG", "RJ", "SP"]]
                      },
                      then: "Sudeste"
                    },
                    {
                      case: { $in: ["$museu.endereco.uf", ["PR", "RS", "SC"]] },
                      then: "Sul"
                    }
                  ],
                  default: "Desconhecida"
                }
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            regiao: "$_id.regiao",
            count: "$count"
          }
        }
      ])

      const regioes = result.reduce((acc, item) => {
        acc[item.regiao] = item.count
        return acc
      }, {})

      return regioes
    } catch (error) {
      console.error(
        "Erro ao realizar busca de declarações por região para o dashboard:",
        error
      )
      throw new Error(
        "Erro ao realizar busca de declarações por região para o dashboard."
      )
    }
  }

  async declaracoesPorAnoDashboard() {
    try {
      const result = await Declaracoes.aggregate([
        {
          $group: {
            _id: "$anoDeclaracao",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 } // Ordenar por ano, se necessário
        }
      ])

      // Transformar o resultado em um objeto com anos como chaves
      const formattedResult = result.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {})

      return formattedResult
    } catch (error) {
      console.error(
        "Erro ao buscar declarações por ano para o dashboard:",
        error
      )
      throw new Error("Erro ao buscar declarações por ano para o dashboard.")
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
    uf: string,
    ultimaDeclaracao: boolean,
  }) {
    try {
      let query = Declaracoes.find()
      if(ultimaDeclaracao || ultimaDeclaracao == null){
        query = query.where("ultimaDeclaracao").equals(true)
      }

      //Lógica para extrair os tipos de status do model e verificar se foi enviado um status válido para filtrar
      const statusEnum = Declaracoes.schema.path("status")
      const statusArray = Object.values(statusEnum)[0]
      const statusExistente = statusArray.includes(status)
      if (statusExistente === true) {
        query = query.where("status").equals(status)
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

      return result.map((d) => {
        const data = d.toJSON()
        // @ts-expect-error - O campo museu_id é um objeto, não uma string
        data.museu_id.endereco.regiao =
          // @ts-expect-error - O campo museu_id é um objeto, não uma string
          regioesMap[data.museu_id.endereco.uf as keyof typeof regioesMap]
        return data
      })
    } catch (error) {
      throw new Error("Erro ao buscar declarações com filtros.")
    }
  }

  async verificarDeclaracaoExistente(museu: string, anoDeclaracao: string) {
    const declaracaoExistente = await Declaracoes.findOne({
      anoDeclaracao,
      museu_id: museu
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
    museu: mongoose.Types.ObjectId | any,
    responsavelEnvio: mongoose.Types.ObjectId | string,
    anoDeclaracao: string,
    declaracaoExistente: any,
    novaVersao: number,
    salt: string
) {
 

    return declaracaoExistente
        ? {
            museu_id: declaracaoExistente.museu_id,
            museu_nome: declaracaoExistente.museu_nome,
            anoDeclaracao: declaracaoExistente.anoDeclaracao,
            responsavelEnvio: declaracaoExistente.responsavelEnvio,
            totalItensDeclarados: declaracaoExistente.totalItensDeclarados,
            status: declaracaoExistente.status,
            retificacao: true,
            retificacaoRef: declaracaoExistente._id as mongoose.Types.ObjectId,
            versao: novaVersao,
            hashDeclaracao: createHash(declaracaoExistente._id as mongoose.Types.ObjectId, salt),
        }
        : {
            anoDeclaracao,
            museu_id: museu,
            museu_nome: museu.nome,
            responsavelEnvio: responsavelEnvio,
            retificacao: false,
            versao: novaVersao,
            status: Status.Recebida,
            hashDeclaracao: createHash(new mongoose.Types.ObjectId(), salt),
        };
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
    novaVersao: number
  ) {
    try {
      if (arquivos && arquivos.length > 0) {
        const novoHashBemCultural = createHashUpdate(
          arquivos[0].path, 
          arquivos[0].filename
        );
  
        let validate = validate_arquivistico;
        if (tipo === "bibliografico") {
          validate = validate_bibliografico;
        } else if (tipo === "museologico") {
          validate = validate_museologico;
        }
  
        const { data: arquivoData, errors: pendencias } = await validate(
          arquivos[0].buffer
        );
  
        const dadosAlterados: Partial<Arquivo> = {
          nome: arquivos[0].filename,
          status: Status.Recebida,
          hashArquivo: novoHashBemCultural,
          pendencias,
          quantidadeItens: arquivoData.length,
          versao: novaVersao
        };
  
        novaDeclaracao[tipo] = {
          ...arquivoAnterior,
          ...dadosAlterados
        } as Arquivo;
  
        arquivoData.forEach((item: { [key: string]: unknown }) => {
          item.declaracao_ref = novaDeclaracao._id;
          item.versao = novaVersao;
        });
  
        let Modelo;
        switch (tipo) {
          case "arquivistico":
            Modelo = Arquivistico;
            break;
          case "bibliografico":
            Modelo = Bibliografico;
            break;
          case "museologico":
            Modelo = Museologico;
            break;
          default:
            throw new Error("Tipo de declaração inválido");
        }
  
        await Modelo.insertMany(arquivoData);
      } else if (arquivoAnterior) {
        novaDeclaracao[tipo] = { ...arquivoAnterior } as Arquivo;
      }
  
      if (novaDeclaracao.retificacaoRef) {
        const declaracaoAnterior = await Declaracoes.findById(
          novaDeclaracao.retificacaoRef
        ).exec() as DeclaracaoModel | null;
  
        if (declaracaoAnterior) {
          novaDeclaracao.retificacaoRef = declaracaoAnterior._id as mongoose.Types.ObjectId;
          novaDeclaracao.retificacao = true;
        }
      }
  
      await novaDeclaracao.save();
    } catch (error) {
      console.error("Erro ao atualizar a declaração:", error);
      throw new Error("Erro ao atualizar a declaração: " + error);
    }
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
    const museu = await Museu.findOne({ _id: museuId, usuario: userId });

    if (!museu) {
      throw new Error("Museu inválido ou você não tem permissão para acessá-lo");
    }

    // Definir o modelo e os campos de projeção com base no tipo de item
    let Model: typeof Arquivistico | typeof Bibliografico | typeof Museologico;
    let retornoPorItem: string;

    switch (tipoItem) {
      case "arquivistico":
        Model = Arquivistico;
        retornoPorItem = "_id coddereferencia titulo nomedoprodutor"; // Defina os campos específicos para arquivistico
        break;
      case "bibliografico":
        Model = Bibliografico;
        retornoPorItem = "_id nderegistro situacao titulo localdeproducao"; // Defina os campos específicos para bibliografico
        break;
      case "museologico":
        Model = Museologico;
        retornoPorItem = "_id nderegistro autor situacao denominacao"; // Defina os campos específicos para museologico
        break;
      default:
        throw new Error("Tipo de item inválido");
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
      return []; // Se não houver versão encontrada, retornar array vazio
    }

    // Segunda agregação: buscar os itens do tipo especificado da maior versão encontrada
    const result = await Model.find({
      versao: maxVersao,
      declaracao_ref: {
        $in: await Declaracoes.find({
          museu_id: new mongoose.Types.ObjectId(museuId),
          anoDeclaracao: ano,
          responsavelEnvio: new mongoose.Types.ObjectId(userId)
        }).select('_id')
      }
    }).select(retornoPorItem);

    return result;
  }
}

export default DeclaracaoService