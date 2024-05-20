import crypto from "crypto";
import Declaracoes from "../models/Declaracao";
import Museu from "../models/Museu";

class DeclaracaoService {


  async declaracaoComFiltros(
    { anoReferencia, status, nomeMuseu, dataInicio, dataFim}:
    { anoReferencia: string, status:string, nomeMuseu:string,dataInicio:any, dataFim:any}
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
      const declaracoes = await query.exec();

      // Mapear as declarações para adicionar o campo "museu" com os dados do museu
      const declaracoesComMuseu = await Promise.all(declaracoes.map(async (declaracao) => {
        const museu = await Museu.findById(declaracao.museu_id);
        return {
          ...declaracao.toObject(),
          museu: museu ? museu.toObject() : null // Aqui que adiciona tods os dados do museu
        };
      }));
      return declaracoesComMuseu;
    } catch (error) {
      console.error("Erro ao buscar declarações com filtros:", error);
      throw new Error("Erro ao buscar declarações com filtros.");
    }
  }

  async criarDeclaracao({ anoDeclaracao, museu_id }: { anoDeclaracao: string; museu_id: string }) {
    try {
      // Gerar o hash da declaração
      const hashDeclaracao = crypto.createHash('sha256').digest('hex');

      // Criar a nova declaração com os campos relacionados à declaração, incluindo museu
      const novaDeclaracao = await Declaracoes.create({
        anoDeclaracao,
        museu_id, // Adicionar museu
        responsavelEnvio: "Vitor Daniel",
        recibo: false,
        hashDeclaracao,
        dataCriacao: new Date(),
        status: "em análise"
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
