import { Request, Response } from "express";
import { Declaracoes, Bibliografico, Museologico, Arquivistico, DeclaracaoModel } from "../models";
import DeclaracaoService from "../service/DeclaracaoService";
import { createHashUpdate, createHash, generateSalt } from "../utils/hashUtils";
import { Museu } from "../models";
import fs from "fs";
import path from "path";
import { Status } from "../enums/Status"
import mongoose from "mongoose";

class DeclaracaoController {
  private declaracaoService: DeclaracaoService;

  constructor() {
    this.declaracaoService = new DeclaracaoService();
    // Faz o bind do contexto atual para as funções
    this.uploadDeclaracao = this.uploadDeclaracao.bind(this);
    this.getDeclaracaoFiltrada = this.getDeclaracaoFiltrada.bind(this);
    this.getDeclaracoesPorAnoDashboard = this.getDeclaracoesPorAnoDashboard.bind(this);
    this.getDeclaracoesPorRegiao = this.getDeclaracoesPorRegiao.bind(this);
    this.getDeclaracoesPorUF = this.getDeclaracoesPorUF.bind(this);
    this.getDeclaracoesPorStatus = this.getDeclaracoesPorStatus.bind(this)
  }
  async atualizarStatusDeclaracao(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const declaracao = await Declaracoes.findById(id);
      if (!declaracao) {
        return res.status(404).json({ message: "Declaração não encontrada." });
      }
      declaracao.status = status;
      await declaracao.save({ validateBeforeSave: false });
      return res.status(200).json(declaracao);
    } catch (error) {
      console.error("Erro ao atualizar status da declaração:", error);
      return res.status(500).json({ message: "Erro ao atualizar status da declaração." });
    }
  }

  async getDeclaracoesPorStatus(req: Request, res: Response) {
    try {
      const declaracoes = await this.declaracaoService.declaracoesPorStatus();
      return res.status(200).json(declaracoes);
    } catch (error) {
      console.error("Erro organizar declarações por status:", error);
      return res.status(500).json({ message: "Erro ao organizar declarações por status para o dashboard." });
    }
  }

  async getDeclaracoesPorUF(req: Request, res: Response) {
    try {
      const declaracoes = await this.declaracaoService.declaracoesPorUF();
      return res.status(200).json(declaracoes);
    } catch (error) {
      console.error("Erro organizar declarações por UF:", error);
      return res.status(500).json({ message: "Erro ao organizar declarações por UF para o dashboard." });
    }
  }

  async getDeclaracoesPorRegiao(req: Request, res: Response) {
    try {
      const declaracoes = await this.declaracaoService.declaracoesPorRegiao();
      return res.status(200).json(declaracoes);
    } catch (error) {
      console.error("Erro organizar declarações por região:", error);
      return res.status(500).json({ message: "Erro ao organizar declarações por região para o dashboard." });
    }
  }

  async getDeclaracoesPorAnoDashboard(req: Request, res: Response) {
    try {
      const declaracoes = await this.declaracaoService.declaracoesPorAnoDashboard();
      return res.status(200).json(declaracoes);
    } catch (error) {
      console.error("Erro organizar declarações por ano:", error);
      return res.status(500).json({ message: "Erro ao organizar declarações por ano para o dashboard." });
    }
  }

  // Retorna uma declaração com base no ano e museu
  async getDeclaracaoAno(req: Request, res: Response) {
    try {
      const { anoDeclaracao, museu } = req.params;
      const declaracao = await Declaracoes.findOne({ anoDeclaracao, museu_id: museu });

      if (!declaracao) {
        return res.status(404).json({ message: "Declaração não encontrada para o ano especificado." });
      }

      return res.status(200).json(declaracao);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar declaração por ano." });
    }
  }

  // Retorna uma declaração com base no id
  async getDeclaracao(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const declaracao = await Declaracoes.findById(id).populate({ path: 'museu_id', model: Museu });

      if (!declaracao) {
        return res.status(404).json({ message: "Declaração não encontrada." });
      }

      return res.status(200).json(declaracao);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar declaração." });
    }
  }

  // Retorna todas as declarações do usuário logado
  async getDeclaracoes(req: Request, res: Response) {
    try {
      // Realiza a agregação para obter a última declaração de cada museu em cada ano
      const result = await Declaracoes.aggregate([
        {
          $match: {
            responsavelEnvio: new mongoose.Types.ObjectId(req.body.user.sub) // Filtra pelo ID do usuário atual
          }
        },
        {
          $sort: { anoDeclaracao: 1, museu_nome: 1, createdAt: -1 } // Ordena por ano, museu e createdAt decrescente
        },
        {
          $group: {
            _id: { museu_id: "$museu_id", anoDeclaracao: "$anoDeclaracao" },
            latestDeclaracao: { $first: "$$ROOT" } // Seleciona a primeira declaração de cada grupo (a mais recente)
          }
        },
        {
          $replaceRoot: { newRoot: "$latestDeclaracao" } // Substitui o documento raiz pelo documento mais recente de cada grupo
        }
      ]);

      // Popula os documentos de museu referenciados pelo campo museu_id nas declarações agregadas
      const populatedResult = await Museu.populate(result, { path: 'museu_id' });

      // Retorna o resultado final
      return res.status(200).json(populatedResult);
    } catch (error) {
      console.error("Erro ao buscar declarações:", error);
      return res.status(500).json({ message: "Erro ao buscar declarações." });
    }
  }
 

  async getStatusEnum(req: Request, res: Response) {
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
      return res.status(500).json({ message: "Erro ao buscar declarações pendentes." });
    }
  }


  async criarDeclaracao(req: Request, res: Response) {
    try {
      const { anoDeclaracao, museu: museu_id, idDeclaracao } = req.params;
      const user_id = req.body.user.sub;
      const museu = await Museu.findOne({ id: museu_id, usuario: user_id });
  
      if (!museu) {
        return res.status(400).json({ success: false, message: "Museu inválido" });
      }
  
      const files = req.files as unknown as { [fieldname: string]: Express.Multer.File[] };
  
      let declaracaoExistente: (mongoose.Document<unknown, {}, DeclaracaoModel> & DeclaracaoModel & Required<{ _id: unknown }>) | null = null;
      let novaDeclaracaoData: Partial<DeclaracaoModel>;
      const salt = generateSalt(); // Gerar um novo salt para a declaração
  
      if (idDeclaracao) {
        // Retificação
        declaracaoExistente = await Declaracoes.findOne({
          _id: idDeclaracao,
          responsavelEnvio: user_id,
          anoDeclaracao,
          museu_id: museu_id,
        }).exec();
  
        if (!declaracaoExistente) {
          return res.status(404).json({ message: "Não foi encontrada uma declaração anterior para retificar." });
        }
  
        // Buscar a declaração mais recente para garantir que a versão é incrementada corretamente
        const ultimaDeclaracao = await Declaracoes.findOne({ museu_id, anoDeclaracao }).sort({ versao: -1 }).exec();
        const novaVersao = (ultimaDeclaracao?.versao || 0) + 1;
  
        novaDeclaracaoData = {
          museu_id: declaracaoExistente.museu_id,
          museu_nome: declaracaoExistente.museu_nome,
          anoDeclaracao: declaracaoExistente.anoDeclaracao,
          responsavelEnvio: declaracaoExistente.responsavelEnvio,
          totalItensDeclarados: declaracaoExistente.totalItensDeclarados,
          status: declaracaoExistente.status,
          retificacao: true,
          retificacaoRef: declaracaoExistente._id as mongoose.Types.ObjectId,
          versao: novaVersao,
          hashDeclaracao: createHash(declaracaoExistente._id as mongoose.Types.ObjectId, salt),
        };
        console.log('Valor de versão após retificação: ' + novaDeclaracaoData.versao);
      } else {
        // Nova declaração
        declaracaoExistente = await this.declaracaoService.verificarDeclaracaoExistente(museu_id, anoDeclaracao);
        const novaVersao = (declaracaoExistente?.versao || 0) + 1;
  
        novaDeclaracaoData = {
          anoDeclaracao,
          museu_id: museu.id,
          museu_nome: museu.nome,
          responsavelEnvio: user_id,
          retificacao: !!declaracaoExistente,
          retificacaoRef: declaracaoExistente ? declaracaoExistente._id as mongoose.Types.ObjectId : undefined,
          versao: novaVersao,
          hashDeclaracao: createHash(new mongoose.Types.ObjectId(), salt), // Criar o hash para a nova declaração
        };
      }
  
      const novaDeclaracao = new Declaracoes(novaDeclaracaoData);
      const novaVersao = novaDeclaracao.versao;
      console.log("Valor de versão da declaração: " + novaVersao);
  
      // Atualizar a nova declaração com os dados dos arquivos, se forem enviados
      await this.declaracaoService.updateDeclaracao(
        files['arquivisticoArquivo'],
        req.body.arquivistico,
        req.body.arquivisticoErros,
        novaDeclaracao,
        'arquivistico',
        declaracaoExistente?.arquivistico || null,
        novaVersao
      );
      await this.declaracaoService.updateDeclaracao(
        files['bibliograficoArquivo'],
        req.body.bibliografico,
        req.body.bibliograficoErros,
        novaDeclaracao,
        'bibliografico',
        declaracaoExistente?.bibliografico || null,
        novaVersao
      );
      console.log(req.body.museologico);
      await this.declaracaoService.updateDeclaracao(
        files['museologicoArquivo'],
        req.body.museologico,
        req.body.museologicoErros,
        novaDeclaracao,
        'museologico',
        declaracaoExistente?.museologico || null,
        novaVersao
      );
  
      await novaDeclaracao.save();
  
      return res.status(200).json(novaDeclaracao);
    } catch (error) {
      console.error("Erro ao enviar uma declaração:", error);
      return res.status(500).json({ message: "Erro ao enviar uma declaração." });
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
  async uploadDeclaracao(req: Request, res: Response) {
    delete req.params.idDeclaracao; // Remove o idDeclaracao para diferenciar a operação
    return this.criarDeclaracao(req, res);
  }
  

  async retificarDeclaracao(req: Request, res: Response) {
    return this.criarDeclaracao(req, res);
  }
  
 


  /**
 * Lista itens por tipo de bem cultural para um museu específico em um determinado ano.
 * @param {string} req.params.museuId - O ID do museu.
 * @param {string} req.params.ano - O ano da declaração.
 * @param {string} req.params.tipo - O tipo de item (Arquivistico, Bibliografico, Museologico).
 * @description Este método verifica se o museu pertence ao usuário que está fazendo a requisição, e se válido, busca itens de um tipo específico (Arquivistico, Bibliografico, Museologico) da maior versão da declaração para aquele museu e ano.
 * * @returns {Promise<void>} - Retorna uma promessa que resolve quando a resposta é enviada ao cliente. A promessa não retorna nenhum valor, mas durante sua execução, ela pode enviar uma resposta JSON contendo os itens encontrados ou uma mensagem de erro apropriada.
 */
  async listarItensPorTipodeBem(req: Request, res: Response) {
    const { museuId, ano, tipo } = req.params;
    const user_id = req.body.user.sub;
  
    try {
      const museu = await Museu.findOne({ _id: museuId, usuario: user_id });
  
      if (!museu) {
        return res.status(400).json({ success: false, message: "Museu inválido ou você não tem permissão para acessá-lo" });
      }
  
      const result = await this.declaracaoService.buscarItensPorTipo(museuId, ano, user_id, tipo);
  
      if (!result) {
        return res.status(404).json({ message: `Itens ${tipo} não encontrados` });
      }
  
      res.status(200).json(result);
    } catch (error) {
      console.error(`Erro ao listar itens ${tipo}:`, error);
  
      if (error instanceof Error) {
        res.status(500).json({ message: `Erro ao listar itens ${tipo}`, error: error.message });
      } else {
        res.status(500).json({ message: `Erro desconhecido ao listar itens ${tipo}` });
      }
    }
  }
  
}

export default DeclaracaoController;
