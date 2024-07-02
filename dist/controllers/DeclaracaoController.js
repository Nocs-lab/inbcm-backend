"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const DeclaracaoService_1 = __importDefault(require("../service/DeclaracaoService"));
const crypto_1 = __importDefault(require("crypto"));
const models_2 = require("../models");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataUtils_1 = require("../utils/dataUtils");
const Status_1 = require("../enums/Status");
class DeclaracaoController {
    declaracaoService;
    constructor() {
        this.declaracaoService = new DeclaracaoService_1.default();
        // Faz o bind do contexto atual para as funções
        this.uploadDeclaracao = this.uploadDeclaracao.bind(this);
        this.getDeclaracaoFiltrada = this.getDeclaracaoFiltrada.bind(this);
        this.getDeclaracoesPorAnoDashboard = this.getDeclaracoesPorAnoDashboard.bind(this);
        this.getDeclaracoesPorRegiao = this.getDeclaracoesPorRegiao.bind(this);
        this.getDeclaracoesPorUF = this.getDeclaracoesPorUF.bind(this);
        this.getDeclaracoesPorStatus = this.getDeclaracoesPorStatus.bind(this);
    }
    async getDeclaracoesPorStatus(req, res) {
        try {
            const declaracoes = await this.declaracaoService.declaracoesPorStatus();
            return res.status(200).json(declaracoes);
        }
        catch (error) {
            console.error("Erro organizar declarações por status:", error);
            return res.status(500).json({ message: "Erro ao organizar declarações por status para o dashboard." });
        }
    }
    async getDeclaracoesPorUF(req, res) {
        try {
            const declaracoes = await this.declaracaoService.declaracoesPorUF();
            return res.status(200).json(declaracoes);
        }
        catch (error) {
            console.error("Erro organizar declarações por UF:", error);
            return res.status(500).json({ message: "Erro ao organizar declarações por UF para o dashboard." });
        }
    }
    async getDeclaracoesPorRegiao(req, res) {
        try {
            const declaracoes = await this.declaracaoService.declaracoesPorRegiao();
            return res.status(200).json(declaracoes);
        }
        catch (error) {
            console.error("Erro organizar declarações por região:", error);
            return res.status(500).json({ message: "Erro ao organizar declarações por região para o dashboard." });
        }
    }
    async getDeclaracoesPorAnoDashboard(req, res) {
        try {
            const declaracoes = await this.declaracaoService.declaracoesPorAnoDashboard();
            return res.status(200).json(declaracoes);
        }
        catch (error) {
            console.error("Erro organizar declarações por ano:", error);
            return res.status(500).json({ message: "Erro ao organizar declarações por ano para o dashboard." });
        }
    }
    // Retorna uma declaração com base no ano e museu
    async getDeclaracaoAno(req, res) {
        try {
            const { anoDeclaracao, museu } = req.params;
            const declaracao = await models_1.Declaracoes.findOne({ anoDeclaracao, museu_id: museu });
            if (!declaracao) {
                return res.status(404).json({ message: "Declaração não encontrada para o ano especificado." });
            }
            return res.status(200).json(declaracao);
        }
        catch (error) {
            console.error("Erro ao buscar declaração por ano:", error);
            return res.status(500).json({ message: "Erro ao buscar declaração por ano." });
        }
    }
    // Retorna uma declaração com base no id
    async getDeclaracao(req, res) {
        try {
            const { id } = req.params;
            const declaracao = await models_1.Declaracoes.findById(id).populate({ path: 'museu_id', model: models_2.Museu });
            if (!declaracao) {
                return res.status(404).json({ message: "Declaração não encontrada." });
            }
            return res.status(200).json(declaracao);
        }
        catch (error) {
            console.error("Erro ao buscar declaração:", error);
            return res.status(500).json({ message: "Erro ao buscar declaração." });
        }
    }
    // Retorna todas as declarações do usuário logado
    async getDeclaracoes(req, res) {
        try {
            const declaracoes = await models_1.Declaracoes.find({ responsavelEnvio: req.body.user.sub }).populate({ path: 'museu_id', model: models_2.Museu }).sort('-createdAt');
            return res.status(200).json(declaracoes);
        }
        catch (error) {
            console.error("Erro ao buscar declarações:", error);
            return res.status(500).json({ message: "Erro ao buscar declarações." });
        }
    }
    async getStatusEnum(req, res) {
        const statusEnum = models_1.Declaracoes.schema.path('status');
        const status = Object.values(statusEnum)[0];
        return res.status(200).json(status);
    }
    async getDeclaracaoFiltrada(req, res) {
        try {
            const declaracoes = await this.declaracaoService.declaracaoComFiltros(req.body);
            return res.status(200).json(declaracoes);
        }
        catch (error) {
            console.error("Erro ao buscar declarações com filtros:", error);
            return res.status(500).json({ message: "Erro ao buscar declarações com filtros." });
        }
    }
    async getDeclaracaoPendente(req, res) {
        try {
            const declaracoes = await models_1.Declaracoes.find({ pendente: true });
            return res.status(200).json(declaracoes);
        }
        catch (error) {
            console.error("Erro ao buscar declarações pendentes:", error);
            return res.status(500).json({ message: "Erro ao buscar declarações pendentes." });
        }
    }
    async uploadDeclaracao(req, res) {
        try {
            const { anoDeclaracao, museu: museu_id } = req.params;
            const museu = await models_2.Museu.findOne({ id: museu_id, usuario: req.body.user.sub });
            if (!museu) {
                return res.status(400).json({ success: false, message: "Museu inválido" });
            }
            const files = req.files;
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
                retificacaoRef: declaracaoExistente ? declaracaoExistente._id : undefined
            });
            if (arquivistico) {
                const arquivisticoData = JSON.parse(req.body.arquivistico);
                const pendenciasArquivistico = JSON.parse(req.body.arquivisticoErros);
                const hashArquivo = crypto_1.default.createHash('sha256').update(JSON.stringify(arquivistico[0])).digest('hex');
                novaDeclaracao.arquivistico = {
                    caminho: arquivistico[0].path,
                    nome: arquivistico[0].filename,
                    status: Status_1.Status.Recebido,
                    hashArquivo,
                    pendencias: pendenciasArquivistico,
                    quantidadeItens: arquivisticoData.length,
                    dataEnvio: (0, dataUtils_1.gerarData)(),
                    versao: 0,
                };
                arquivisticoData.forEach((item) => item.declaracao_ref = novaDeclaracao._id);
                await models_1.Arquivistico.insertMany(arquivisticoData);
            }
            else {
                novaDeclaracao.arquivistico = {
                    status: Status_1.Status.NaoEnviado,
                    pendencias: [],
                    quantidadeItens: 0,
                    dataEnvio: (0, dataUtils_1.gerarData)(),
                    versao: 0,
                };
            }
            if (bibliografico) {
                const bibliograficoData = JSON.parse(req.body.bibliografico);
                const pendenciasBibliografico = JSON.parse(req.body.bibliograficoErros);
                const hashArquivo = crypto_1.default.createHash('sha256').update(JSON.stringify(bibliografico[0])).digest('hex');
                novaDeclaracao.bibliografico = {
                    caminho: bibliografico[0].path,
                    nome: bibliografico[0].filename,
                    status: Status_1.Status.Recebido,
                    hashArquivo,
                    pendencias: pendenciasBibliografico,
                    quantidadeItens: bibliograficoData.length,
                    dataEnvio: (0, dataUtils_1.gerarData)(),
                    versao: 0,
                };
                bibliograficoData.forEach((item) => item.declaracao_ref = novaDeclaracao._id);
                await models_1.Bibliografico.insertMany(bibliograficoData);
            }
            else {
                novaDeclaracao.bibliografico = {
                    status: Status_1.Status.NaoEnviado,
                    pendencias: [],
                    quantidadeItens: 0,
                    dataEnvio: (0, dataUtils_1.gerarData)(),
                    versao: 0,
                };
            }
            if (museologico) {
                const museologicoData = JSON.parse(req.body.museologico);
                const pendenciasMuseologico = JSON.parse(req.body.museologicoErros);
                const hashArquivo = crypto_1.default.createHash('sha256').update(JSON.stringify(museologico[0])).digest('hex');
                novaDeclaracao.museologico = {
                    caminho: museologico[0].path,
                    nome: museologico[0].filename,
                    status: Status_1.Status.Recebido,
                    hashArquivo,
                    pendencias: pendenciasMuseologico,
                    quantidadeItens: museologicoData.length,
                    dataEnvio: (0, dataUtils_1.gerarData)(),
                    versao: 0,
                };
                museologicoData.forEach((item) => item.declaracao_ref = novaDeclaracao._id);
                await models_1.Museologico.insertMany(museologicoData);
            }
            else {
                novaDeclaracao.museologico = {
                    status: Status_1.Status.NaoEnviado,
                    pendencias: [],
                    quantidadeItens: 0,
                    dataEnvio: (0, dataUtils_1.gerarData)(),
                    versao: 0,
                };
            }
            await novaDeclaracao.save();
            // Enviar arquivos para a fila e atualizar as declarações separadamente para cada tipo
            return res.status(200).json({ message: "Declaração enviada com sucesso!" });
        }
        catch (error) {
            console.error("Erro ao enviar arquivos para a declaração:", error);
            return res.status(500).json({ message: "Erro ao enviar arquivos para a declaração." });
        }
    }
    async downloadDeclaracao(req, res) {
        try {
            const { museu, anoDeclaracao, tipoArquivo } = req.params;
            const user_id = req.body.user.sub;
            const declaracao = await models_1.Declaracoes.findOne({ museu_id: museu, anoDeclaracao, responsavelEnvio: user_id });
            if (!declaracao) {
                return res.status(404).json({ message: "Declaração não encontrada para o ano especificado." });
            }
            let arquivo = null;
            if (tipoArquivo === 'arquivistico') {
                arquivo = declaracao.arquivistico;
            }
            else if (tipoArquivo === 'bibliografico') {
                arquivo = declaracao.bibliografico;
            }
            else if (tipoArquivo === 'museologico') {
                arquivo = declaracao.museologico;
            }
            if (!arquivo) {
                return res.status(404).json({ message: "Arquivo não encontrado para o tipo especificado." });
            }
            const filePath = path_1.default.join(__dirname, '..', 'uploads', arquivo.nome);
            const file = fs_1.default.createReadStream(filePath);
            res.setHeader('Content-Disposition', `attachment; filename=${arquivo.nome}`);
            res.setHeader('Content-Type', 'application/octet-stream');
            file.pipe(res);
        }
        catch (error) {
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
    async retificarDeclaracao(req, res) {
        try {
            const { anoDeclaracao, museu, idDeclaracao } = req.params;
            const user_id = req.body.user.sub;
            let declaracao = await models_1.Declaracoes.findOne({
                _id: idDeclaracao,
                responsavelEnvio: user_id,
                anoDeclaracao: anoDeclaracao,
                museu_id: museu
            });
            if (!declaracao) {
                return res.status(404).json({ message: "Declaração não encontrada para o ano especificado." });
            }
            declaracao.retificacao = true;
            declaracao.dataAtualizacao = (0, dataUtils_1.gerarData)();
            declaracao.status = Status_1.Status.Recebido;
            const files = req.files;
            await this.declaracaoService.updateDeclaracao(files?.arquivisticoArquivo, req.body.arquivistico, req.body.arquivisticoErros, declaracao, 'arquivistico');
            await this.declaracaoService.updateDeclaracao(files?.bibliograficoArquivo, req.body.bibliografico, req.body.bibliograficoErros, declaracao, 'bibliografico');
            await this.declaracaoService.updateDeclaracao(files?.museologicoArquivo, req.body.museologico, req.body.museologicoErros, declaracao, 'museologico');
            await declaracao.save();
            return res.status(200).json(declaracao);
        }
        catch (error) {
            console.error("Erro ao retificar declaração:", error);
            return res.status(500).json({ message: "Erro ao retificar declaração." });
        }
    }
}
exports.default = DeclaracaoController;
