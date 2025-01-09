import express from "express"
import DeclaracaoController from "../../controllers/DeclaracaoController"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"

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
  userPermissionMiddleware("getAnosValidos"),
  declaracaoController.getAnosValidos.bind(declaracaoController)
)
routes.get(
  "/analistas",
  userPermissionMiddleware("listarAnalistas"),
  declaracaoController.listarAnalistas.bind(declaracaoController)
)

routes.put(
  "/:id/analises",
  userPermissionMiddleware("enviarParaAnalise"),
  declaracaoController.enviarParaAnalise.bind(declaracaoController)
)

routes.get(
  "/:id/timeline",
  userPermissionMiddleware("getTimeLine"),
  declaracaoController.getTimeLine.bind(declaracaoController)
)

routes.put(
  "/:id/analises-concluir",
  userPermissionMiddleware("concluirAnalise"),
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
  userPermissionMiddleware("getDeclaracaoFiltrada"),
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
  userPermissionMiddleware("getDeclaracaoFiltrada"),
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
  userPermissionMiddleware("atualizarStatusDeclaracao"),
  declaracaoController.atualizarStatusBensDeclaracao
)

/**
 * @swagger
 * /restaurar/{declaracaoId}:
 *   put:
 *     summary: Restaura uma declaração excluída para o status "Recebida".
 *     description: Restaura uma declaração com status "Excluída", caso não existam versões mais recentes não excluídas para o mesmo museu e ano correspondente.
 *     tags:
 *       - Declarações
 *     parameters:
 *       - in: path
 *         name: declaracaoId
 *         required: true
 *         description: ID da declaração que será restaurada.
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: [] # Para autenticação JWT, se aplicável.
 *     responses:
 *       200:
 *         description: Declaração restaurada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Declaração restaurada com sucesso para 'Recebida'.
 *                 declaracao:
 *                   $ref: '#/components/schemas/Declaracao' # Esquema de declaração, se definido.
 *       400:
 *         description: Erro na restauração da declaração.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Não é possível restaurar esta declaração porque há versões mais recentes de declaração.
 *       404:
 *         description: Declaração não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Declaração não encontrada.
 */
routes.put(
  "/restaurar/:declaracaoId",
  userPermissionMiddleware("restaurarDeclaracao"),
  declaracaoController.restaurarDeclaracao
)

/**
 * @swagger
 * /alterar-analistas/{declaracaoId}/{arquivoTipo}:
 *   put:
 *     summary: Altera o analista responsável por um arquivo vinculado a uma declaração.
 *     description: Atualiza o analista responsável por um arquivo específico de uma declaração. Registra o evento na timeline e salva as alterações.
 *     tags:
 *       - Declarações
 *     parameters:
 *       - in: path
 *         name: declaracaoId
 *         required: true
 *         description: ID da declaração que contém o arquivo.
 *         schema:
 *           type: string
 *       - in: path
 *         name: arquivoTipo
 *         required: true
 *         description: Tipo do arquivo dentro da declaração (arquivistico, bibliografico, museologico).
 *         schema:
 *           type: string
 *           enum: [arquivistico, bibliografico, museologico]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               analistaId:
 *                 type: string
 *                 description: ID do novo analista que será vinculado ao arquivo.
 *                 example: "64a3f890b3f45b0010c8e123"
 *     responses:
 *       200:
 *         description: Analista alterado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Analista vinculado ao arquivo bibliografico com sucesso.
 *                 arquivo:
 *                   type: object
 *                   description: Informações do arquivo atualizado.
 *                   properties:
 *                     analistasResponsaveisNome:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Novo Analista"]
 *                 timeLine:
 *                   type: array
 *                   description: Linha do tempo da declaração atualizada com o evento.
 *                   items:
 *                     type: object
 *                     properties:
 *                       nomeEvento:
 *                         type: string
 *                         example: Mudança de analista
 *                       dataEvento:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-07T12:00:00Z"
 *                       autorEvento:
 *                         type: string
 *                         example: "Autor da Mudança"
 *                       analistaResponsavel:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Novo Analista"]
 *       400:
 *         description: Erro na alteração do analista.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Declaração não encontrada.
 *       500:
 *         description: Erro interno no servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro desconhecido
 */
routes.put(
  "/alterar-analistas/:declaracaoId/:arquivoTipo",
  userPermissionMiddleware("alterarAnalistaArquivo"),
  declaracaoController.alterarAnalistaArquivo
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
  userPermissionMiddleware("getDeclaracoesAgrupadasPorAnalista"),
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
routes.get(
  "/:id",
  userPermissionMiddleware("getDeclaracao"),
  declaracaoController.getDeclaracao
)

export default routes
