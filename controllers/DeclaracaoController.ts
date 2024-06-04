import { Request, Response } from "express";
import { Declaracoes } from "../models";
import DeclaracaoService from "../service/DeclaracaoService";
import crypto from "crypto";
import { Museu } from "../models";
import { Bibliografico } from "../models";
import { Museologico } from "../models";
import { Arquivistico } from "../models";
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

  async getDeclaracaoPendente(req: Request, res: Response) {
    try {
      const declaracoes = await Declaracoes.find({ pendente: true });
      return res.status(200).json(declaracoes);
    } catch (error) {
      console.error("Erro ao buscar declarações pendentes:", error);
      return res.status(500).json({ message: "Erro ao buscar declarações pendentes." });
    }
  }

  async uploadDeclaracao(req: Request, res: Response) {
    try {
      const { anoDeclaracao, museu: museu_id } = req.params;
      const museu = await Museu.findOne({ id: museu_id, usuario: req.body.user.sub  })
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
      const declaracaoExistente = await this.declaracaoService.verificarDeclaracaoExistente(museu_id, anoDeclaracao);


      const novaDeclaracao = await this.declaracaoService.criarDeclaracao({
        anoDeclaracao,
        museu_id: museu.id,
        museu_nome: museu.nome,
        user_id: req.body.user.sub,
        retificacao: declaracaoExistente ? true : false,
        retificacaoRef: declaracaoExistente ? declaracaoExistente._id as unknown as string : undefined
      });

      if (arquivistico) {
        const arquivisticoData = JSON.parse(req.body.arquivistico);
        const pendenciasArquivistico = JSON.parse(req.body.arquivisticoErros)
        const hashArquivo = crypto.createHash('sha256').update(JSON.stringify(arquivistico[0])).digest('hex');
        novaDeclaracao.arquivistico = {
          caminho: arquivistico[0].path,
          nome: arquivistico[0].filename,
          status: 'em análise',
          hashArquivo,
          pendencias: pendenciasArquivistico,
          quantidadeItens: arquivisticoData.length,
        };

        arquivisticoData.forEach((item: { declaracao_ref: any; }) => item.declaracao_ref = novaDeclaracao._id);

        await Arquivistico.insertMany(arquivisticoData);
      } else {
        novaDeclaracao.arquivistico = {
          status: 'não enviado',
          pendencias: [],
          quantidadeItens: 0
        }
      }

      if (bibliografico) {
        const bibliograficoData = JSON.parse(req.body.bibliografico);
        const pendenciasBibliografico = JSON.parse(req.body.bibliograficoErros);
        const hashArquivo = crypto.createHash('sha256').update(JSON.stringify(bibliografico[0])).digest('hex');
        novaDeclaracao.bibliografico = {
          caminho: bibliografico[0].path,
          nome: bibliografico[0].filename,
          status: 'em análise',
          hashArquivo,
          pendencias: pendenciasBibliografico,
          quantidadeItens: bibliograficoData.length,
        };

        bibliograficoData.forEach((item: { declaracao_ref: any; }) => item.declaracao_ref = novaDeclaracao._id);

        await Bibliografico.insertMany(bibliograficoData);
      } else {
        novaDeclaracao.bibliografico = {
          status: 'não enviado',
          pendencias: [],
          quantidadeItens: 0
        }
      }

      if (museologico) {
        const museologicoData = JSON.parse(req.body.museologico);
        const pendenciasMuseologico = JSON.parse(req.body.museologicoErros);
        const hashArquivo = crypto.createHash('sha256').update(JSON.stringify(museologico[0])).digest('hex');
        novaDeclaracao.museologico = {
          caminho: museologico[0].path,
          nome: museologico[0].filename,
          status: 'em análise',
          hashArquivo,
          pendencias: pendenciasMuseologico,
          quantidadeItens: museologicoData.length,
        };

        museologicoData.forEach((item: { declaracao_ref: any; }) => item.declaracao_ref = novaDeclaracao._id);

        await Museologico.insertMany(museologicoData);
      } else {
        novaDeclaracao.museologico = {
          status: 'não enviado',
          pendencias: [],
          quantidadeItens: 0
        }
      }

      await novaDeclaracao.save();

      // Enviar arquivos para a fila e atualizar as declarações separadamente para cada tipo

      return res.status(200).json({ message: "Declaração enviada com sucesso!" });
    } catch (error) {
      console.error("Erro ao enviar arquivos para a declaração:", error);
      return res.status(500).json({ message: "Erro ao enviar arquivos para a declaração." });
    }
  }

  async retificarDeclaracao(req: Request, res: Response) {
    try {
      const { anoDeclaracao, museu, idDeclaracao } = req.params;
      const user_id = req.body.user.sub;

      const declaracao = await Declaracoes.findOne({
        _id: idDeclaracao,
        responsavelEnvio: user_id,
        anoDeclaracao: anoDeclaracao,
        museu_id: museu
      });

      if (!declaracao) {
        return res.status(404).json({ message: "Declaração não encontrada para o ano especificado." });
      }

      const retificacao = await this.declaracaoService.updateDeclaracao({ idDeclaracao });

      console.log(retificacao);

      return res.status(200).json(retificacao);
    } catch (error) {
      console.error("Erro ao retificar declaração:", error);
      return res.status(500).json({ message: "Erro ao retificar declaração." });
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
