import crypto from "crypto";
import Declaracoes from "../models/Declaracao";

class DeclaracaoService {

  async criarDeclaracao(anoDeclaracao: string) {
    try {
      // Gerar o hash da declaração
      const hashDeclaracao = crypto.createHash('sha256').digest('hex');

      // Criar a nova declaração apenas com os campos relacionados à declaração
      const novaDeclaracao = await Declaracoes.create({
        anoDeclaracao:anoDeclaracao,
        responsavelEnvio: "Thiago Campos",
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

  async verificarDeclaracaoExistente(anoDeclaracao: string) {
    // Verifique se existe uma declaração com o ano fornecido
    const declaracaoExistente = await Declaracoes.findOne({ anoDeclaracao });

    return declaracaoExistente;
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
