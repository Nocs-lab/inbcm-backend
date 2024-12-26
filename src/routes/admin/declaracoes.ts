import express from "express"
import DeclaracaoController from "../../controllers/DeclaracaoController"
import { adminMiddleware } from "../../middlewares/AuthMiddlewares"

const routes = express.Router()
const declaracaoController = new DeclaracaoController()

/**
 * @swagger
 * /public/declaracoes/anosValidos/{qtdAnos}:
 *   get:
 *     summary: Retorna uma lista de anos válidos a partir do ano atual
 *     description: Gera uma lista de anos válidos com base no ano atual e no parâmetro `qtdAnos`, que define a quantidade de anos na lista.
 *     parameters:
 *       - in: path
 *         name: qtdAnos
 *         required: true
 *         description: A quantidade de anos que deseja listar, a partir do ano atual.
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Lista de anos válidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 anos:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [2024, 2023, 2022, 2021, 2020]
 *       400:
 *         description: Parâmetro inválido (quando `qtdAnos` não é um número)
 *       500:
 *         description: Erro interno ao processar a solicitação
 */
routes.get(
  "/anos-validos/:qtdAnos",
  adminMiddleware,
  declaracaoController.getAnosValidos.bind(declaracaoController)
)
routes.get(
  "/analistas",
  adminMiddleware,
  declaracaoController.listarAnalistas.bind(declaracaoController)
)

routes.put(
  "/:id/analises",
  adminMiddleware,
  declaracaoController.enviarParaAnalise.bind(declaracaoController)
)

routes.get(
  "/:id/timeline",
  adminMiddleware,
  declaracaoController.getTimeLine.bind(declaracaoController)
)

routes.put(
  "/:id/analises-concluir",
  adminMiddleware,
  declaracaoController.concluirAnalise.bind(declaracaoController)
)

/**
 * @swagger
 * /api/admin/declaracoes/declaracoesFiltradas:
 *   get:
 *     summary: Obtém declarações com base em filtros.
 *     description: Endpoint para buscar declarações com base em filtros especificados.
 *     tags:
 *       - Declarações
 *     responses:
 *       '200':
 *         description: Declarações filtradas obtidas com sucesso.
 *       '500':
 *         description: Erro ao buscar declarações com filtros.
 */
routes.post(
  "/declaracoesFiltradas",
  adminMiddleware,
  declaracaoController.getDeclaracaoFiltrada
)

/**
 * @swagger
 * /api/admin/declaracoes/declaracoesFiltradas:
 *   post:
 *     summary: Obtém declarações com base em filtros.
 *     description: Endpoint para buscar declarações com base em filtros especificados.
 *     tags:
 *       - Declarações
 *     responses:
 *       '200':
 *         description: Declarações filtradas obtidas com sucesso.
 *       '500':
 *         description: Erro ao buscar declarações com filtros.
 */
routes.post(
  "/declaracoesFiltradas",
  adminMiddleware,
  declaracaoController.getDeclaracaoFiltrada
)

// atualizar status
/**
 * @swagger
 * /api/admin/declaracoes/atualizarStatus/{id}:
 *  put:
 *   summary: Atualiza o status de uma declaração.
 *   description: Endpoint para atualizar o status de uma declaração.
 *   parameters:
 *    - in: path
 *      name: id
 *      type: string
 *   requestBody:
 *     required: true
 *     content:
 *       application/*:
 *         schema:
 *           type: object
 *           proporties:
 *             status:
 *               type: string
 *         required:
 *           - status
 *   tags:
 *     - Declarações
 *   responses:
 *     '200':
 *       description: a
 */
routes.put(
  "/atualizarStatus/:id",
  adminMiddleware,
  declaracaoController.atualizarStatusDeclaracao
)

/**
 * @swagger
 * /api/admin/declaracoes/analistas-filtrados:
 *   get:
 *     summary: Obtém a quantidade de declarações agrupadas por analista.
 *     description: Este endpoint retorna a quantidade de declarações atribuídas a cada analista, agrupadas pelo analista responsável, filtradas pelos últimos X anos.
 *     tags:
 *       - Declarações
 *     parameters:
 *       - in: query
 *         name: anos
 *         schema:
 *           type: integer
 *           example: 5
 *         description: Filtro de tempo para buscar declarações dos últimos X anos. O valor padrão é 5 anos se não for informado.
 */

routes.get(
  "/analistas-filtrados",
  adminMiddleware,
  declaracaoController.getDeclaracoesAgrupadasPorAnalista.bind(
    declaracaoController
  )
)

/**
 * @swagger
 * /api/admin/declaracoes/{id}:
 *   get:
 *     summary: Obtém uma declaração pelo ID.
 *     description: Endpoint para obter uma declaração específica pelo seu ID.
 *     tags:
 *       - Declarações
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID da declaração a ser obtida.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Declaração obtida com sucesso.
 *       '404':
 *         description: Declaração não encontrada para o ID especificado.
 *       '500':
 *         description: Erro ao buscar declaração.
 */
routes.get("/:id", adminMiddleware, declaracaoController.getDeclaracao)

/**
 * @swagger
 * /api/admin/declaracoes/download/{museu}/{anoDeclaracao}/{tipoArquivo}:
 *   get:
 *     summary: Baixa um arquivo de declaração.
 *     description: Endpoint para baixar um arquivo de declaração para o museu e ano especificados.
 *     tags:
 *       - Declarações
 *     parameters:
 *       - in: path
 *         name: museu
 *         description: ID do museu ao qual a declaração pertence.
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: anoDeclaracao
 *         description: Ano da declaração do arquivo a ser baixado.
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tipoArquivo
 *         description: Tipo de arquivo a ser baixado (arquivistico, bibliografico ou museologico).
 *         required: true
 *         schema:
 *           type: string
 *           enum: [arquivistico, bibliografico, museologico]
 *     responses:
 *       '200':
 *         description: Arquivo de declaração baixado com sucesso.
 *       '404':
 *         description: Declaração não encontrada para o ano especificado ou arquivo não encontrado para o tipo especificado.
 *       '500':
 *         description: Erro ao baixar arquivo da declaração.
 */
routes.get(
  "/download/:museu/:anoDeclaracao/:tipoArquivo",
  adminMiddleware,
  declaracaoController.downloadDeclaracao
)

/**
 * @swagger
 * /api/admin/declaracoes/listar-itens/:museuId/:ano/:tipo:
 *   get:
 *     summary: Lista os itens de uma determinada declaracao por tipo de bem museal.
 *     description: Endpoint retornar os itens por tipo de bem museal.
 *     tags:
 *       - Declarações
 *     parameters:
 *       - in: path
 *         name: museuId
 *         description: ID do museu ao qual a declaração pertence.
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: ano
 *         description: Ano da declaração do arquivo a ser baixado.
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tipo
 *         description: Tipo de arquivo a ser baixado (arquivistico, bibliografico ou museologico).
 *         required: true
 *         schema:
 *           type: string
 *           enum: [arquivistico, bibliografico, museologico]
 *     responses:
 *       '200':
 *         description: Arquivo de declaração baixado com sucesso.
 *       '404':
 *         description: Declaração não encontrada para o ano especificado ou arquivo não encontrado para o tipo especificado.
 *       '500':
 *         description: Erro ao baixar arquivo da declaração.
 */
routes.get(
  "/listar-itens/:museuId/:ano/:tipo",
  adminMiddleware,
  declaracaoController.listarItensPorTipodeBem.bind(declaracaoController)
)

export default routes
