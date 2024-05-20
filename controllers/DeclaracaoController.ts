import { Request, Response } from "express";
import Declaracoes from "../models/Declaracao";
import DeclaracaoService from "../service/DeclaracaoService";
import UploadService from "../queue/ProducerDeclaracao";
import crypto from "crypto";
import Museu from "../models/Museu";
import path from "path";
import fs from "fs";

class DeclaracaoController {
  private declaracaoService: DeclaracaoService;
  private uploadService: UploadService;

  constructor() {
    this.declaracaoService = new DeclaracaoService();
    this.uploadService = new UploadService();
    // Faz o bind do contexto atual para a função uploadDeclaracao
    this.uploadDeclaracao = this.uploadDeclaracao.bind(this);
    this.getDeclaracaoFiltrada = this.getDeclaracaoFiltrada.bind(this);
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
      return res.status(200).json(declaracoes);
    } catch (error) {
      console.error("Erro ao buscar declarações:", error);
      return res.status(500).json({ message: "Erro ao buscar declarações." });
    }
  }

  async getStatusEnum(req: Request, res: Response){
    const statusEnum = Declaracoes.schema.path('status');
    const status = Object.values(statusEnum)[0];
    return res.status(200).json(status);
  }

  async getDeclaracaoFiltrada(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const { anoDeclaracao } = req.body; // Obter o status do corpo da requisição
      const declaracoes = await this.declaracaoService.declaracaoComFiltros(req.body);
      return res.status(200).json(declaracoes);
    } catch (error) {
      console.error("Erro ao buscar declarações com filtros:", error);
      return res.status(500).json({ message: "Erro ao buscar declarações com filtros." });
    }
  }

  async uploadDeclaracao(req: Request, res: Response) {
    try {
      const { anoDeclaracao, museu: museu_id } = req.params;
      const files = req.files as any
      const arquivistico = files.arquivistico;
      const bibliografico = files.bibliografico;
      const museologico = files.museologico;
      // Verificar se a declaração já existe para o ano especificado
      let declaracaoExistente = await this.declaracaoService.verificarDeclaracaoExistente(museu_id, anoDeclaracao);

      // Se não existir, criar uma nova declaração
      if (!declaracaoExistente) {
        declaracaoExistente = await this.declaracaoService.criarDeclaracao({
          anoDeclaracao,
          museu_id, // Adicionar museu ao criar a declaração
        });
        console.log("Declaração criada com sucesso.");
      } else {
        // Atualizar o museu na declaração existente se necessário
        declaracaoExistente.museu_id = (await Museu.findById(museu_id))!;
        await declaracaoExistente.save();
      }

      if (arquivistico) {
        const hashArquivo = crypto.createHash('sha256').update(arquivistico[0]).digest('hex');
        await this.uploadService.sendToQueue(arquivistico[0], 'arquivistico', anoDeclaracao);
        await this.declaracaoService.atualizarArquivistico(anoDeclaracao, {
          nome: 'arquivistico',
          status: 'em análise',
          hashArquivo,
        });
      }

      if (bibliografico) {
        const hashArquivo = crypto.createHash('sha256').update(bibliografico[0]).digest('hex');
        await this.uploadService.sendToQueue(bibliografico[0], 'bibliografico', anoDeclaracao);
        await this.declaracaoService.atualizarBibliografico(anoDeclaracao, {
          nome: 'bibliografico',
          status: 'em análise',
          hashArquivo,
        });
      }

      if (museologico) {
        const hashArquivo = crypto.createHash('sha256').update(museologico[0]).digest('hex');
        await this.uploadService.sendToQueue(museologico[0], 'museologico', anoDeclaracao);
        await this.declaracaoService.atualizarMuseologico(anoDeclaracao, {
          nome: 'museologico',
          status: 'em análise',
          hashArquivo,
        });
      }

      // Enviar arquivos para a fila e atualizar as declarações separadamente para cada tipo

      return res.status(200).json({ message: "Declaração enviada com sucesso!" });
    } catch (error) {
      console.error("Erro ao enviar arquivos para a declaração:", error);
      return res.status(500).json({ message: "Erro ao enviar arquivos para a declaração." });
    }
  }


  async downloadDeclaracao(req: Request, res: Response) {
    try {
      const filename = req.params.filename;
      const filePath = path.join(__dirname, '..', 'uploads', filename);

      // Verifica se o arquivo existe
      if (fs.existsSync(filePath)) {
        res.download(filePath, (err) => {
          if (err) {
            console.error("Erro ao fazer o download do arquivo:", err);
            res.status(500).json({ message: "Erro ao fazer o download do arquivo." });
          }
        });
      } else {
        res.status(404).json({ message: "Arquivo não encontrado." });
      }
    } catch (error) {
      console.error("Erro ao processar o download do arquivo:", error);
      res.status(500).json({ message: "Erro ao processar o download do arquivo." });
    }
  }
}

export default DeclaracaoController;
