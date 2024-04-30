import Declaracoes from "../../models/Declaracao";
import crypto from "crypto";

class DeclaracaoService {
  async listarDeclaracoes() {
    try {
      const declaracoes = await Declaracoes.find();

      return declaracoes;
    } catch (error) {
      throw new Error("Erro ao listar declarações: " + (error as Error).message);
    }
  }
  async criarDeclaracao(anoDeclaracao: string) {
    try {
      // Gerar o hash da declaração
      const hashDeclaracao = crypto.createHash('sha256').digest('hex');

      // Criar a nova declaração apenas com os campos relacionados à declaração
      const novaDeclaracao = await Declaracoes.create({
        anoDeclaracao,
        responsavelEnvio: "Thiago Campos",
        recibo: false,
        hashDeclaracao,
        dataCriacao: new Date(),
        status: "em processamento"
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

  async atualizarArquivistico(anoDeclaracao: string, arquivisticoData: any) {
    try {
      // Encontrar a declaração pelo anoDeclaracao
      const declaracao = await Declaracoes.findOne({ anoDeclaracao });

      if (!declaracao) {
        throw new Error("Declaração não encontrada.");
      }

      // Atualizar os campos específicos do arquivístico na declaração
      declaracao.arquivistico = arquivisticoData;

      // Salvar a declaração atualizada no banco de dados
      const declaracaoAtualizada = await declaracao.save();

      return declaracaoAtualizada;
    } catch (error) {
      throw new Error("Erro ao atualizar declaração com dados do arquivístico: " + (error as Error).message);
    }
  }
}

export default DeclaracaoService;
