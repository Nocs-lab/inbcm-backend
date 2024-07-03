import { Request, Response } from "express";
import { Declaracoes,Bibliografico,Museologico,Arquivistico, DeclaracaoModel} from "../models";
import DeclaracaoService from "../service/DeclaracaoService";
import { createHashUpdate } from "../utils/hashUtils";
import { Museu } from "../models";
import fs from "fs";
import path from "path";
import { Status } from "../enums/Status"
import { Types } from "mongoose";

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
    this.getDeclaracoesPorStatus = this.getDeclaracoesPorStatus.bind(this);
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
      const declaracao = await Declaracoes.findOne({ anoDeclaracao, museu_id: museu});

      if (!declaracao) {
        return res.status(404).json({ message: "Declaração não encontrada para o ano especificado." });
      }

      return res.status(200).json(declaracao);
    } catch (error) {
      console.error("Erro ao buscar declaração por ano:", error);
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
      console.error("Erro ao buscar declaração:", error);
      return res.status(500).json({ message: "Erro ao buscar declaração." });
    }
  }

  // Retorna todas as declarações do usuário logado
  async getDeclaracoes(req: Request, res: Response) {
    try {
      
      const result = await Declaracoes.aggregate([
        {
          $sort: { anoDeclaracao: 1, museu_nome: 1, createdAt: -1 } 
        },
        {
          $group: {
            _id: { anoDeclaracao: "$anoDeclaracao", museu_id: "$museu_id" },
            latestDeclaracao: { $first: "$$ROOT" } 
          }
        },
        {
          $replaceRoot: { newRoot: "$latestDeclaracao" } 
        }
      ]).exec(); 
      const populatedResult = await Museu.populate(result, { path: 'museu_id' }); 
      console.log(populatedResult)
      return res.status(200).json(populatedResult);
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

      const files = req.files as unknown as { [fieldname: string]: Express.Multer.File[] };
      const arquivistico = files.arquivisticoArquivo;
      const bibliografico = files.bibliograficoArquivo;
      const museologico = files.museologicoArquivo;
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
        const hashArquivo = createHashUpdate(arquivistico[0].path, arquivistico[0].filename);
        novaDeclaracao.arquivistico = {
          caminho: arquivistico[0].path,
          nome: arquivistico[0].filename,
          status: Status.Recebido,
          hashArquivo,
          pendencias: pendenciasArquivistico,
          quantidadeItens: arquivisticoData.length,
          versao: 0,

        };

        arquivisticoData.forEach((item: { declaracao_ref: string; }) => item.declaracao_ref = novaDeclaracao._id  as string);

        await Arquivistico.insertMany(arquivisticoData);
      } else {
        novaDeclaracao.arquivistico = {
          status: Status.NaoEnviado,
          pendencias: [],
          quantidadeItens: 0,
          versao: 0,

        }
      }

      if (bibliografico) {
        const bibliograficoData = JSON.parse(req.body.bibliografico);
        const pendenciasBibliografico = JSON.parse(req.body.bibliograficoErros);
        const hashArquivo = createHashUpdate(bibliografico[0].path, bibliografico[0].filename);
        novaDeclaracao.bibliografico = {
          caminho: bibliografico[0].path,
          nome: bibliografico[0].filename,
          status: Status.Recebido,
          hashArquivo,
          pendencias: pendenciasBibliografico,
          quantidadeItens: bibliograficoData.length,
          versao: 0,
        };

        bibliograficoData.forEach((item: { declaracao_ref: string; }) => item.declaracao_ref = novaDeclaracao._id  as string);

        await Bibliografico.insertMany(bibliograficoData);
      } else {
        novaDeclaracao.bibliografico = {
          status: Status.NaoEnviado,
          pendencias: [],
          quantidadeItens: 0,
          versao: 0,

        }
      }

      if (museologico) {
        const museologicoData = JSON.parse(req.body.museologico);
        const pendenciasMuseologico = JSON.parse(req.body.museologicoErros);
        const hashArquivo = createHashUpdate(museologico[0].path, museologico[0].filename);
        novaDeclaracao.museologico = {
          caminho: museologico[0].path,
          nome: museologico[0].filename,
          status: Status.Recebido,
          hashArquivo,
          pendencias: pendenciasMuseologico,
          quantidadeItens: museologicoData.length,
          versao: 0,

        };

        museologicoData.forEach((item: { declaracao_ref: string; }) => item.declaracao_ref = novaDeclaracao._id  as string);

        await Museologico.insertMany(museologicoData);
      } else {
        novaDeclaracao.museologico = {
          status: Status.NaoEnviado,
          pendencias: [],
          quantidadeItens: 0,
          versao: 0,

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

  /**
 * Retifica uma declaração existente com base nos parâmetros fornecidos na requisição e nos arquivos enviados.
 *
 *  @param req.params - Parâmetros da rota:
 *    @param anoDeclaracao - Ano da declaração.
 *    @param museu - ID do museu.
 *    @param idDeclaracao - ID da declaração a ser retificada.
 *  @param req.body - Corpo da requisição:
 *    @param user.sub - ID do usuário responsável pelo envio.
 *    @param arquivistico - Dados arquivísticos.
 *    @param arquivisticoErros - Erros de dados arquivísticos.
 *    @param bibliografico - Dados bibliográficos.
 *    @param bibliograficoErros - Erros de dados bibliográficos.
 *    @param museologico - Dados museológicos.
 *    @param museologicoErros - Erros de dados museológicos.
 *  @param req.files - Arquivos enviados:
 *    @param arquivisticoArquivo - Arquivo arquivístico.
 *    @param bibliograficoArquivo - Arquivo bibliográfico.
 *    @param museologicoArquivo - Arquivo museológico.
 * @returns Retorna a declaração atualizada ou um erro.
 */
  async retificarDeclaracao(req: Request, res: Response) {
    try {
      const { anoDeclaracao, museu, idDeclaracao } = req.params;
      const user_id = req.body.user.sub;
  
      // Encontrar a última versão da declaração
      let declaracao = await Declaracoes.findOne({
        _id: idDeclaracao,
        responsavelEnvio: user_id,
        anoDeclaracao,
        museu_id: museu,
      }).exec();
  
      if (!declaracao) {
        return res.status(404).json({ message: "Declaração não encontrada para o ano especificado." });
      }
  
      // Propagar apenas as propriedades conhecidas do modelo DeclaracaoModel
      const novaDeclaracaoData: Partial<DeclaracaoModel> = {
        museu_id: declaracao.museu_id,
        museu_nome: declaracao.museu_nome,
        anoDeclaracao: declaracao.anoDeclaracao,
        responsavelEnvio: declaracao.responsavelEnvio,
        hashDeclaracao: declaracao.hashDeclaracao,
        totalItensDeclarados: declaracao.totalItensDeclarados,
        status: declaracao.status,
        arquivistico: declaracao.arquivistico,
        bibliografico: declaracao.bibliografico,
        museologico: declaracao.museologico,
        retificacao: true,
        retificacaoRef: declaracao._id as Types.ObjectId,
        versao: declaracao.versao + 1,
      };
  
      // Criar nova declaração a partir dos dados da versão anterior
      const novaDeclaracao = new Declaracoes(novaDeclaracaoData);
  
      const files = req.files as unknown as { [fieldname: string]: Express.Multer.File[] };
  
      // Verificar e atualizar apenas os campos que foram modificados
      await this.declaracaoService.updateDeclaracao(files['arquivisticoArquivo'], req.body.arquivistico, req.body.arquivisticoErros, novaDeclaracao, 'arquivistico', declaracao.arquivistico);
      await this.declaracaoService.updateDeclaracao(files['bibliograficoArquivo'], req.body.bibliografico, req.body.bibliograficoErros, novaDeclaracao, 'bibliografico', declaracao.bibliografico);
      await this.declaracaoService.updateDeclaracao(files['museologicoArquivo'], req.body.museologico, req.body.museologicoErros, novaDeclaracao, 'museologico', declaracao.museologico);

      // Salvar a nova declaração
      await novaDeclaracao.save();
  
      return res.status(200).json(novaDeclaracao);
    } catch (error) {
      console.error("Erro ao retificar declaração:", error);
      return res.status(500).json({ message: "Erro ao retificar declaração." });
    }
  }
}

export default DeclaracaoController;
