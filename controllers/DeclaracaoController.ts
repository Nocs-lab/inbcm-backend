import { Request, Response } from "express";
import Declaracoes from "../models/Declaracao";
import DeclaracaoService from "../service/DeclaracaoService";
import crypto from "crypto";
import Museu from "../models/Museu";
import Bibliografico from "../models/Bibliografico";
import Museologico from "../models/Museologico";
import Arquivistico from "../models/Arquivistico";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
class DeclaracaoController {
  private declaracaoService: DeclaracaoService;

  constructor() {
    this.declaracaoService = new DeclaracaoService();
    // Faz o bind do contexto atual para a função uploadDeclaracao
    this.uploadDeclaracao = this.uploadDeclaracao.bind(this);
    this.getDeclaracaoFiltrada = this.getDeclaracaoFiltrada.bind(this);
  }

  async listarPendencias(req: Request, res: Response) {
    try {
      const { declaracaoId, tipoArquivo } = req.params;
      const userId = req.body.user.sub;
      console.log(userId)
      console.log(declaracaoId)
      // Verifica se os parâmetros são válidos
      if (!mongoose.Types.ObjectId.isValid(declaracaoId)) {
        return res.status(400).json({ success: false, message: "ID da declaração inválido." });
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "ID do usuário inválido." });
      }

      // Chama o método do service para recuperar as pendências
      const pendencias = await this.declaracaoService.recuperarPendencias(
        new mongoose.Types.ObjectId(declaracaoId),
        new mongoose.Types.ObjectId(userId),
        tipoArquivo
      );

      return res.status(200).json({ success: true, pendencias });
    } catch (error: any) {
      console.error("Erro ao recuperar pendências:", error);
      return res.status(500).json({ success: false, message: "Erro ao recuperar pendências." });
    }
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
      const declaracoes = await Declaracoes.find({ responsavelEnvio: req.body.user.sub }).populate('responsavelEnvio')
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
      
      const museu = await Museu.findOne({ id: museu_id, usuario: req.body.user.sub });
      console.log(museu)
      if (!museu) {
        return res.status(400).json({ success: false, message: "Museu inválido" });
      }

      const files = req.files as any;
      const arquivistico = files.arquivisticoArquivo;
      const bibliografico = files.bibliograficoArquivo;
      const museologico = files.museologicoArquivo;
       // Log dos arquivos recebidos
       console.log('Arquivos recebidos:', files);

       // Log dos dados do corpo da requisição
       console.log('Dados do corpo da requisição:', req.body);
      // Verificar se a declaração já existe para o ano especificado
      let declaracaoExistente = await this.declaracaoService.verificarDeclaracaoExistente(museu_id, anoDeclaracao);

      // Se não existir, criar uma nova declaração
      if (!declaracaoExistente) {
        declaracaoExistente = await this.declaracaoService.criarDeclaracao({
          anoDeclaracao,
          museu_id: museu.id,
          user_id: req.body.user.sub,
        });
        console.log("Declaração criada com sucesso.");
      } else {
        // Atualizar o museu na declaração existente se necessário
        declaracaoExistente.museu_id = (await Museu.findById(museu_id))!;
        await declaracaoExistente.save();
      }

      if (arquivistico) {
        const arquivisticoData = JSON.parse(req.body.arquivistico);
        const pendenciasArquivistico = JSON.parse(req.body.arquivisticoErros)
        const hashArquivo = crypto.createHash('sha256').update(JSON.stringify(arquivistico[0])).digest('hex');
        await this.declaracaoService.atualizarArquivistico(anoDeclaracao, {
          nome: arquivistico[0].filename,
          status: 'em análise',
          hashArquivo,
        });

        await Arquivistico.insertMany(arquivisticoData);
          // Aqui acontece a magica de capturar as pendencias,invocando o metodo adicoinarPendencias do declaracaoService
        if (pendenciasArquivistico.length > 0) {
          await this.declaracaoService.adicionarPendencias(anoDeclaracao, 'arquivistico', pendenciasArquivistico);
        }
        declaracaoExistente.arquivistico.quantidadeItens = arquivisticoData.length;
      }

      if (bibliografico) {
        const bibliograficoData = JSON.parse(req.body.bibliografico);
        const pendenciasBibliografico = JSON.parse(req.body.bibliograficoErros);
        const hashArquivo = crypto.createHash('sha256').update(JSON.stringify(bibliografico[0])).digest('hex');
        await this.declaracaoService.atualizarBibliografico(anoDeclaracao, {
          nome: bibliografico[0].filename,
          status: 'em análise',
          hashArquivo,
        });

        await Bibliografico.insertMany(bibliograficoData);
        // Aqui acontece a magica de capturar as pendencias,invocando o metodo adicoinarPendencias do declaracaoService
        if (pendenciasBibliografico.length > 0) {
          await this.declaracaoService.adicionarPendencias(anoDeclaracao, 'bibliografico', pendenciasBibliografico);
        }
        //Adiciona quantidade de itens
        declaracaoExistente.bibliografico.quantidadeItens = bibliograficoData.length;
      }

      if (museologico) {
        const museologicoData = JSON.parse(req.body.museologico);
        console.log(`Itens museologicos ${museologicoData}`)
        const pendenciasMuseologico = JSON.parse(req.body.museologicoErros);
        const hashArquivo = crypto.createHash('sha256').update(JSON.stringify(museologico[0])).digest('hex');
        await this.declaracaoService.atualizarMuseologico(anoDeclaracao, {
          nome: museologico[0].filename,
          status: 'em análise',
          hashArquivo,
        });

        await Museologico.insertMany(museologicoData);
        // Aqui acontece a magica de capturar as pendencias,invocando o metodo adicoinarPendencias do declaracaoService
        if (pendenciasMuseologico.length > 0) {
          await this.declaracaoService.adicionarPendencias(anoDeclaracao, 'museologico', pendenciasMuseologico);
        }
        declaracaoExistente.museologico.quantidadeItens = museologicoData.length;
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
      const { museu, anoDeclaracao, tipoArquivo } = req.params;
      const user_id = req.body.user.sub;
      const declaracao = await Declaracoes.findOne({ museu_id: museu, anoDeclaracao, responsavelEnvio: user_id});

      if (!declaracao) {
        return res.status(404).json({ message: "Declaração não encontrada para o ano especificado." });
      }

      let arquivo = null;
      if (tipoArquivo === 'arquivistico') {
        arquivo = declaracao.arquivistico;
      } else if (tipoArquivo === 'bibliografico') {
        arquivo = declaracao.bibliografico;
      } else if (tipoArquivo === 'museologico') {
        arquivo = declaracao.museologico;
      }

      if (!arquivo) {
        return res.status(404).json({ message: "Arquivo não encontrado para o tipo especificado." });
      }

      const filePath = path.join(__dirname, '..', 'uploads', arquivo.nome!);
      const file = fs.createReadStream(filePath);

      res.setHeader('Content-Disposition', `attachment; filename=${arquivo.nome}`);
      res.setHeader('Content-Type', 'application/octet-stream');

      file.pipe(res);
    } catch (error) {
      console.error("Erro ao baixar arquivo da declaração:", error);
      return res.status(500).json({ message: "Erro ao baixar arquivo da declaração." });
    }
  }
}

export default DeclaracaoController;
