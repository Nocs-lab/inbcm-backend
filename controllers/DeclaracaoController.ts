import { Request, Response } from "express";
import Declaracoes from "../models/Declaracao";
import DeclaracaoService from "../service/DeclaracaoService";
import UploadService from "../queue/ProducerDeclaracao";
import crypto from "crypto";

class DeclaracaoController {
  private declaracaoService: DeclaracaoService;
  private uploadService: UploadService;

  constructor() {
    this.declaracaoService = new DeclaracaoService();
    this.uploadService = new UploadService();

    // Faz o bind do contexto atual para a função uploadDeclaracao
    this.uploadDeclaracao = this.uploadDeclaracao.bind(this);
  }

  async getDeclaracaoAno(req: Request, res: Response) {
    try {
      const { anoDeclaracao } = req.params;
      const declaracao = await Declaracoes.findOne({ anoDeclaracao });

      if (!declaracao) {
        return res.status(404).json({ message: "Declaração não encontrada para o ano especificado." });
      }

      return res.status(200).json(declaracao);
    } catch (error) {
      console.error("Erro ao buscar declaração por ano:", error);
      return res.status(500).json({ message: "Erro ao buscar declaração por ano." });
    }
  }

  async getDeclaracao(req: Request, res: Response) {
    try {
      const declaracoes = await Declaracoes.find();

      if (declaracoes.length === 0) {
        return res.status(404).json({ message: "Nenhuma declaração foi encontrada." });
      }

      return res.status(200).json(declaracoes);
    } catch (error) {
      console.error("Erro ao buscar declarações:", error);
      return res.status(500).json({ message: "Erro ao buscar declarações." });
    }
  }

  async uploadDeclaracao(req: Request, res: Response) {
    try {
      const { anoDeclaracao } = req.params;
      const arquivistico = req.files?.arquivistico;
      const bibliografico = req.files?.bibliografico;
      const museologico = req.files?.museologico;
      // Verificar se a declaração já existe para o ano especificado
      let declaracaoExistente = await this.declaracaoService.verificarDeclaracaoExistente(anoDeclaracao);

      // Se não existir, criar uma nova declaração
      if (!declaracaoExistente) {
        declaracaoExistente = await this.declaracaoService.criarDeclaracao(anoDeclaracao);
        console.log("Declaração criada com sucesso.");
      }
      if (arquivistico) {
        const hashArquivo = crypto.createHash('sha256').digest('hex');
        await this.uploadService.sendToQueue(arquivistico[0], 'arquivistico', anoDeclaracao);
        await this.declaracaoService.atualizarArquivistico(anoDeclaracao, {
            nome: 'arquivistico',
            status: 'em análise',
            hashArquivo: hashArquivo,
        });
      }

      if (bibliografico) {
        const hashArquivo = crypto.createHash('sha256').digest('hex');
        await this.uploadService.sendToQueue(bibliografico[0], 'bibliografico', anoDeclaracao);
        await this.declaracaoService.atualizarBibliografico(anoDeclaracao, {
            nome: 'bibliografico',
            status: 'em análise',
            hashArquivo: hashArquivo,
        });
      }

      if (museologico) {
        const hashArquivo = crypto.createHash('sha256').digest('hex');
        await this.uploadService.sendToQueue(museologico[0], 'museologico', anoDeclaracao);
        await this.declaracaoService.atualizarMuseologico(anoDeclaracao, {
            nome: 'museologico',
            status: 'em análise',
             hashArquivo: hashArquivo,
        });
      }

      // Enviar arquivos para a fila e atualizar as declarações separadamente para cada tipo

      return res.status(200).json({ message: "Declaração enviada com sucesso!" });
    } catch (error) {
      console.error("Erro ao enviar arquivos para a declaração:", error);
      return res.status(500).json({ message: "Erro ao enviar arquivos para a declaração." });
    }
  }
}

export default DeclaracaoController;
