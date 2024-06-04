import crypto from "crypto";
import { Declaracoes, Usuario, DeclaracaoModel, Pendencia, Museu } from "../models";
import mongoose from "mongoose";

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
      return await query.populate([{ path: 'museu_id', model: Museu, select: [""] }, { path: "responsavelEnvio", model: Usuario }]).exec();
    } catch (error) {
      console.error("Erro ao buscar declarações com filtros:", error);
      throw new Error("Erro ao buscar declarações com filtros.");
    }
  }

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
        const hashDeclaracao = crypto.createHash('sha256').digest('hex');
        console.log(user_id);
        // Criar a nova declaração com os campos relacionados à declaração, incluindo museu
        const novaDeclaracao = await Declaracoes.create({
            anoDeclaracao,
            museu_id, // Adicionar museu
            museu_nome,
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

  async updateDeclaracao({ idDeclaracao }: { idDeclaracao: string }) {
    try {
      const declaracaoExistente = await Declaracoes.findById(idDeclaracao);
      if (!declaracaoExistente) {
        throw new Error("Declaração não encontrada.");
      }

      const declaracaoRetificada = await Declaracoes.findByIdAndUpdate(
        idDeclaracao,
        {
          retificacao: true,
          dataAtualizacao: new Date(),
          versao: declaracaoExistente.versao + 1,
          status: "em análise"
        },
        { new: true }
      );

      return declaracaoRetificada;
    } catch (error: any) {
      throw new Error("Erro ao retificar declaração: " + error.message);
    }
  }

}

export default DeclaracaoService;
