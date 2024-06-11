import crypto from "crypto";
import { Declaracoes, Museu } from "../models";

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

  async criarDeclaracao({ anoDeclaracao, museu_id, user_id, retificacao = false, retificacaoRef }: { anoDeclaracao: string; museu_id: string; user_id: string; retificacao?: boolean; retificacaoRef?: string }) {
    try {
      // Gerar o hash da declaração
      const hashDeclaracao = crypto.createHash('sha256').digest('hex');
      console.log(user_id);
      // Criar a nova declaração com os campos relacionados à declaração, incluindo museu
      const novaDeclaracao = await Declaracoes.create({
        anoDeclaracao,
        museu_id, // Adicionar museu
        responsavelEnvio: user_id,
        hashDeclaracao,
        dataCriacao: new Date(),
        status: "em análise",
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

  async atualizarArquivosDeclaracao(anoDeclaracao: string, dadosArquivos: any) {
    try {
      const declaracao = await Declaracoes.findOne({ anoDeclaracao });
      if (!declaracao) {
        throw new Error("Declaração não encontrada para o ano especificado.");
      }

      // Atualizar os dados dos arquivos
      if (dadosArquivos.arquivistico) {
        declaracao.arquivistico = dadosArquivos.arquivistico;
      }
      if (dadosArquivos.bibliografico) {
        declaracao.bibliografico = dadosArquivos.bibliografico;
      }
      if (dadosArquivos.museologico) {
        declaracao.museologico = dadosArquivos.museologico;
      }

      await declaracao.save();
      return declaracao;
    } catch (error: any) {
      throw new Error("Erro ao atualizar dados dos arquivos da declaração: " + error.message);
    }
  }


  async atualizarArquivistico(anoDeclaracao: string, dadosArquivistico: any) {
    try {
      const declaracao = await Declaracoes.findOne({ anoDeclaracao });
      if (!declaracao) {
        throw new Error("Declaração não encontrada para o ano especificado.");
      }

      declaracao.arquivistico = { ...declaracao.arquivistico, ...dadosArquivistico };
      await declaracao.save();
      return declaracao;
    } catch (error: any) {
      throw new Error("Erro ao atualizar dados arquivísticos: " + error.message);
    }
  }

  async atualizarBibliografico(anoDeclaracao: string, dadosBibliografico: any) {
    try {
      const declaracao = await Declaracoes.findOne({ anoDeclaracao });
      if (!declaracao) {
        throw new Error("Declaração não encontrada para o ano especificado.");
      }
      declaracao.bibliografico = { ...declaracao.bibliografico, ...dadosBibliografico };
      await declaracao.save();
      return declaracao;
    } catch (error: any) {
      throw new Error("Erro ao atualizar dados arquivísticos: " + error.message);
    }
  }

  async atualizarMuseologico(anoDeclaracao: string, dadosMuseologico: any) {
    try {
      const declaracao = await Declaracoes.findOne({ anoDeclaracao });
      if (!declaracao) {
        throw new Error("Declaração não encontrada para o ano especificado.");
      }
      declaracao.museologico = { ...declaracao.museologico, ...dadosMuseologico };
      await declaracao.save();
      return declaracao;
    } catch (error: any) {
      throw new Error("Erro ao atualizar dados arquivísticos: " + error.message);
    }
  }

  async atualizarStatusDeclaracao(hashArquivo: string, tipoArquivo: string, novoStatus: any) {
    try {
      // Buscar a declaração pelo hash do arquivo e pelo tipo de arquivo
      const declaracao = await Declaracoes.findOne({ hashArquivo, tipoArquivo });

      // Verificar se a declaração foi encontrada
      if (!declaracao) {
        throw new Error("Declaração não encontrada para o hash e tipo de arquivo especificados.");
      }

      // Atualizar o status da declaração
      declaracao.status = novoStatus;
      await declaracao.save();
    } catch (error: any) {
      throw new Error("Erro ao atualizar o status da declaração: " + error.message);
    }
  }

}

export default DeclaracaoService;
