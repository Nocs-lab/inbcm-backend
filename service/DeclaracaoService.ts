
import { Status } from "../enums/Status";
import { gerarData } from "../utils/dataUtils"
import { createHash, createHashUpdate} from "../utils/hashUtils";
import { Declaracoes,Museu,Arquivo, Arquivistico, Bibliografico, Museologico, DeclaracaoModel } from "../models";
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
    { anoReferencia, status, nomeMuseu, dataInicio, dataFim, regiao, uf}:
    { anoReferencia: string, status:string, nomeMuseu:string,dataInicio:any, dataFim:any, regiao:string, uf:string}
    ) {

    try {
      let query = Declaracoes.find();

      //Lógica para extrair os tipos de status do model e verificar se foi enviado um status válido para filtrar
      const statusEnum = Declaracoes.schema.path('status');
      const statusArray = Object.values(statusEnum)[0];
      const statusExistente = statusArray.includes(status);
      if (statusExistente === true){
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
      if (anoReferencia){
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
      console.error("Erro ao buscar declarações com filtros:", error);
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

  async criarDeclaracao({ anoDeclaracao, museu_id, user_id, retificacao = false, retificacaoRef, museu_nome }:
    { anoDeclaracao: string; museu_id: string; user_id: string; retificacao?: boolean; retificacaoRef?: string;
       museu_nome: string}) {
    try {
        // Verificar se já existe uma declaração para o ano e museu especificados
        const declaracaoExistente = await this.verificarDeclaracaoExistente(museu_id, anoDeclaracao);
        if (declaracaoExistente) {
            throw new Error("Você já enviou uma declaração para este museu e ano especificados. Se você deseja retificar a declaração, utilize a opção de retificação.");
        }

        // Gerar o hash da declaração
        const hashDeclaracao = createHash({ anoDeclaracao, museu_id });

        console.log(user_id);
        // Criar a nova declaração com os campos relacionados à declaração, incluindo museu
        const novaDeclaracao = await Declaracoes.create({
            anoDeclaracao,
            museu_id, // Adicionar museu
            museu_nome,
            responsavelEnvio: user_id,
            hashDeclaracao,
            dataCriacao: gerarData(),
            status: Status.Recebido,
            retificacao,
            retificacaoRef
        });

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
  arquivoAnterior: Arquivo
) {
  if (arquivos) {
    const arquivoData = JSON.parse(data);
    const pendencias = JSON.parse(errors);
    const novoHashDeclaracao = createHashUpdate(arquivos[0].path, arquivos[0].filename);

    // Verificar se os dados foram modificados
    const dadosAlterados: Partial<Arquivo> = {
      caminho: arquivos[0].path,
      nome: arquivos[0].filename,
      status: Status.Recebido,
      hashArquivo:novoHashDeclaracao,
      pendencias,
      quantidadeItens: arquivoData.length,
      versao: arquivoAnterior.versao + 1,
    };

    // Atualizar apenas os campos modificados
    novaDeclaracao[tipo] = { ...arquivoAnterior, ...dadosAlterados } as Arquivo;

    arquivoData.forEach((item: any) => {
      item.declaracao_ref = novaDeclaracao._id as string;
      item.versao = novaDeclaracao.versao;
    });

    // Determinar o modelo apropriado com base no tipo
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

    // Inserir os dados associados à nova versão da declaração
    const itensInseridos = await Modelo.insertMany(arquivoData.map((item: any) => ({
      ...item,
      declaracao_ref: novaDeclaracao._id,
      versao: novaDeclaracao.versao, // Atribui a versão atual da declaração ao item
    })));

    console.log(`Inseridos ${itensInseridos.length} itens relacionados à nova versão da declaração`);
  } else {
    // Mantém os dados anteriores se não houver novo upload
    novaDeclaracao[tipo] = { ...arquivoAnterior }; // Certifique-se de copiar corretamente
  }

  // Atualizar a referência da retificação
  const declaracaoAnterior = await Declaracoes.findById(novaDeclaracao.retificacaoRef).exec() as DeclaracaoModel | null;
  if (declaracaoAnterior && declaracaoAnterior._id) {
    novaDeclaracao.retificacaoRef = declaracaoAnterior._id as mongoose.Types.ObjectId; // Referência para a declaração anterior
    novaDeclaracao.retificacao = true;
  }

  // Salvar a nova declaração
  await novaDeclaracao.save();
}

}

export default DeclaracaoService;
