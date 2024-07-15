import crypto from "crypto";
import { Status } from "../enums/Status";
import { createHash, createHashUpdate } from "../utils/hashUtils";
import { Declaracoes, Museu, Arquivo, Arquivistico, Bibliografico, Museologico, DeclaracaoModel } from "../models";
import mongoose from "mongoose";

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
      ]);

      const statusCounts = result.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {});

      return statusCounts;
    } catch (error) {
      console.error("Erro ao realizar busca de declarações por status para o dashboard:", error);
      throw new Error("Erro ao realizar busca de declarações por status para o dashboard.");
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
      ]);

      const ufs = result.reduce((acc, item) => {
        acc[item.uf] = item.count;
        return acc;
      }, {});

      return ufs;
    } catch (error) {
      console.error("Erro ao realizar busca de declarações por UF para o dashboard:", error);
      throw new Error("Erro ao realizar busca de declarações por UF para o dashboard.");
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
                    { case: { $in: ["$museu.endereco.uf", ["AC", "AP", "AM", "PA", "RO", "RR", "TO"]] }, then: "Norte" },
                    { case: { $in: ["$museu.endereco.uf", ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"]] }, then: "Nordeste" },
                    { case: { $in: ["$museu.endereco.uf", ["DF", "GO", "MT", "MS"]] }, then: "Centro-Oeste" },
                    { case: { $in: ["$museu.endereco.uf", ["ES", "MG", "RJ", "SP"]] }, then: "Sudeste" },
                    { case: { $in: ["$museu.endereco.uf", ["PR", "RS", "SC"]] }, then: "Sul" }
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
      ]);

      const regioes = result.reduce((acc, item) => {
        acc[item.regiao] = item.count;
        return acc;
      }, {});

      return regioes;
    } catch (error) {
      console.error("Erro ao realizar busca de declarações por região para o dashboard:", error);
      throw new Error("Erro ao realizar busca de declarações por região para o dashboard.");
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
      ]);

      // Transformar o resultado em um objeto com anos como chaves
      const formattedResult = result.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      return formattedResult;
    } catch (error) {
      console.error("Erro ao buscar declarações por ano para o dashboard:", error);
      throw new Error("Erro ao buscar declarações por ano para o dashboard.");
    }
  }


  async declaracaoComFiltros(
    { anoReferencia, status, nomeMuseu, dataInicio, dataFim, regiao, uf }:
      { anoReferencia: string, status: string, nomeMuseu: string, dataInicio: any, dataFim: any, regiao: string, uf: string }
  ) {

    try {
      let query = Declaracoes.find();

      //Lógica para extrair os tipos de status do model e verificar se foi enviado um status válido para filtrar
      const statusEnum = Declaracoes.schema.path('status');
      const statusArray = Object.values(statusEnum)[0];
      const statusExistente = statusArray.includes(status);
      if (statusExistente === true) {
        query = query.where('status').equals(status);
      }

      // Filtro para UF
      if (uf) {
        const museus = await Museu.find({ "endereco.uf": uf });
        const museuIds = museus.map(museu => museu._id);
        query = query.where('museu_id').in(museuIds);
      }

      // Definindo o mapeamento de regiões para UFs
      const regioesMap: { [key: string]: string[] } = {
        'norte': ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
        'nordeste': ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
        'centro-oeste': ['GO', 'MT', 'MS', 'DF'],
        'sudeste': ['ES', 'MG', 'RJ', 'SP'],
        'sul': ['PR', 'RS', 'SC']
      };
      // Filtro por cada região
      if (regiao) {
        const lowerCaseRegiao = regiao.toLowerCase();
        if (lowerCaseRegiao in regioesMap) {
          const ufs = regioesMap[lowerCaseRegiao];
          const museus = await Museu.find({ "endereco.uf": { $in: ufs } });
          const museuIds = museus.map(museu => museu._id);
          query = query.where('museu_id').in(museuIds);
        }
      }

      //Filtro para ano da declaração
      if (anoReferencia) {
        query = query.where('anoDeclaracao').equals(anoReferencia);
      }

      //Filtro por data
      if (dataInicio && dataFim) {
        const startDate = new Date(dataInicio);
        const endDate = new Date(dataFim);
        endDate.setHours(23, 59, 59, 999); // Definir o final do dia para a data de fim

        query = query.where('dataCriacao').gte(dataInicio).lte(dataFim);
      }

      //Filtro para o nome do museu
      if (nomeMuseu) {
        const museus = await Museu.find({ nome: nomeMuseu });
        const museuIds = museus.map(museu => museu._id);
        query = query.where('museu_id').in(museuIds);
      }
      const result = await query.populate([{ path: 'museu_id', model: Museu, select: [""] }]).sort('-dataCriacao').exec();

      return result.map(d => {
        const data = d.toJSON();
        // @ts-ignore
        data.museu_id.endereco.regiao = regioesMap[data.museu_id.endereco.uf as keyof typeof regioesMap];
        return data;
      });
    } catch (error) {
      throw new Error("Erro ao buscar declarações com filtros.");
    }
  }

  /**
 * Processa e atualiza um tipo específico de bem (arquivístico, bibliográfico ou museológico) em uma declaração.
 *
 * @param anoDeclaracao - ano de criacao da declaracao.
 * @param museu_id - id do museu o qual deseja-se criar uma declaracao.
 * @param retificacao - faz referenciao ao estado de originalidade de declaracao.
 * @param retificacaoRef - A declaração que está sendo atualizada.
 * @param muse_nome - nome do museu o qual deseja-se criar uma declaracao
 *
 * @returns retorna uma nova declaracao ou um erro ao tentar criar uma declaracao
 */

  async criarDeclaracao({
    anoDeclaracao,
    museu_id,
    user_id,
    retificacao = false,
    retificacaoRef,
    museu_nome,
    versao,
  }: {
    anoDeclaracao: string;
    museu_id: string;
    user_id: string;
    retificacao?: boolean;
    retificacaoRef?: string;
    museu_nome: string;
    versao: number;
  }): Promise<DeclaracaoModel> {
    try {
      const declaracaoExistente = await this.verificarDeclaracaoExistente(museu_id, anoDeclaracao);
      if (declaracaoExistente) {
        throw new Error("Você já enviou uma declaração para este museu e ano especificados. Se deseja retificar a declaração, utilize a opção de retificação.");
      }

      // Gerar um novo salt para esta declaração
      const salt = crypto.randomBytes(16).toString('hex');

      const novaDeclaracao = new Declaracoes({
        anoDeclaracao,
        museu_id,
        museu_nome,
        responsavelEnvio: user_id,
        status: Status.Recebida,
        retificacao,
        retificacaoRef,
        versao,
      });

      await novaDeclaracao.save();

      return novaDeclaracao;
    } catch (error: any) {
      throw new Error("Erro ao criar declaração: " + error.message);
    }
  }




  async verificarDeclaracaoExistente(museu: string, anoDeclaracao: string) {
    // Verifique se existe uma declaração com o ano fornecido
    const declaracaoExistente = await Declaracoes.findOne({ anoDeclaracao, museu_id: museu });

    return declaracaoExistente;
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
    data: string,
    errors: string,
    novaDeclaracao: DeclaracaoModel,
    tipo: 'arquivistico' | 'bibliografico' | 'museologico',
    arquivoAnterior: Arquivo | null,
    novaVersao: number // Este parâmetro define a versão da nova declaração
  ) {
    try {
      if (arquivos && arquivos.length > 0) {
        // Processa os dados do arquivo e erros
        const arquivoData = JSON.parse(data);
        const pendencias = JSON.parse(errors);
        const novoHashBemCultural = createHashUpdate(
          arquivos[0].path,
          arquivos[0].filename
        );
       
        // Define os novos dados para o arquivo
        const dadosAlterados: Partial<Arquivo> = {
          caminho: arquivos[0].path,
          nome: arquivos[0].filename,
          status: Status.Recebida,
          hashArquivo: novoHashBemCultural,
          pendencias,
          quantidadeItens: arquivoData.length,
          versao: novaVersao, // Atribui a nova versão ao arquivo
        };

        // Atualiza apenas os campos modificados na nova declaração
        novaDeclaracao[tipo] = { ...arquivoAnterior, ...dadosAlterados } as Arquivo;

        // Atualiza os itens relacionados à nova versão da declaração
        arquivoData.forEach((item: any) => {
          item.declaracao_ref = novaDeclaracao._id; // Atualiza a referência para a nova declaração
          item.versao = novaVersao; // Atribui a nova versão ao item
        });

        // Determina o modelo apropriado com base no tipo de declaração
        let Modelo;
        switch (tipo) {
          case 'arquivistico':
            Modelo = Arquivistico;
            break;
          case 'bibliografico':
            Modelo = Bibliografico;
            break;
          case 'museologico':
            Modelo = Museologico;
            break;
          default:
            throw new Error('Tipo de declaração inválido');
        }

        // Insere os dados associados à nova versão da declaração no banco de dados
        await Modelo.insertMany(arquivoData);

      } else if (arquivoAnterior) {
        // Mantém os dados anteriores se não houver novo upload
        novaDeclaracao[tipo] = { ...arquivoAnterior } as Arquivo;
      }

      // Atualiza a referência da retificação, se aplicável
      if (novaDeclaracao.retificacaoRef) {
        const declaracaoAnterior = await Declaracoes.findById(novaDeclaracao.retificacaoRef).exec() as DeclaracaoModel | null;
        if (declaracaoAnterior && declaracaoAnterior._id) {
          novaDeclaracao.retificacaoRef = declaracaoAnterior._id as mongoose.Types.ObjectId;
          novaDeclaracao.retificacao = true;
        }
      }

      // Salva a nova declaração atualizada no banco de dados
      await novaDeclaracao.save();
    } catch (error) {
      throw error;
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
  async buscarItensPorTipo(museuId: string, ano: string, userId: string, tipoItem: string) {
    try {
      // Verificar se o museu pertence ao usuário específico
      const museu = await Museu.findOne({ _id: museuId, usuario: userId });

      if (!museu) {
        throw new Error("Museu inválido ou você não tem permissão para acessá-lo");
      }

      // Definir o modelo e os campos de projeção com base no tipo de item
      let Model;
      let projectFields;

      switch (tipoItem) {
        case 'Arquivistico':
          Model = Arquivistico;
          projectFields = {
            _id: 1,
            codigoReferencia: 1,
            titulo: 1,
            nomeProdutor: 1
          };
          break;
        case 'Bibliografico':
          Model = Bibliografico;
          projectFields = {
            _id: 1,
            numeroRegistro: 1,
            situacao: 1,
            titulo: 1,
            localProducao: 1
          };
          break;
        case 'Museologico':
          Model = Museologico;
          projectFields = {
            _id: 1,
            numeroRegistro: 1,
            situacao: 1,
            denominacao: 1,
            autor: 1
          };
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
      ]);

      const maxVersao = maxVersaoResult[0]?.maxVersao;

      if (maxVersao === undefined) {
        return []; // Se não houver versão encontrada, retornar array vazio
      }

      // Segunda agregação: buscar os itens do tipo especificado da maior versão encontrada
      const result = await Model.aggregate([
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
            versao: maxVersao,
            "declaracoes.museu_id": new mongoose.Types.ObjectId(museuId),
            "declaracoes.anoDeclaracao": ano,
            "declaracoes.responsavelEnvio": new mongoose.Types.ObjectId(userId),
            __t: tipoItem
          }
        },
        {
          $project: projectFields
        }
      ]);

      return result;
    } catch (error) {
      throw error;
    }
  }
}







export default DeclaracaoService;
