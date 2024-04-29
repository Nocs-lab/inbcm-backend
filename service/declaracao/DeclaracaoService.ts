import Declaracoes from "../../models/Declaracao";
import crypto from "crypto";

class DeclaracaoService {
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
}

export default DeclaracaoService;