import express from "express"
import { adminMiddleware } from "../../middlewares/AuthMiddlewares"
import DeclaracaoController from "../../controllers/DeclaracaoController"

const declaracaoController = new DeclaracaoController()

const routes = express.Router()

/**
 * @swagger
 * /api/admin/dashboard/getStatusEnum:
 *   get:
 *     summary: Obtém os valores de enumeração para o status das declarações.
 *     description: Endpoint para obter os valores de enumeração para o status das declarações.
 *     tags:
 *       - Declarações
 *     responses:
 *       '200':
 *         description: Valores de enumeração para o status das declarações obtidos com sucesso.
 */
routes.get(
  "/getStatusEnum",
  adminMiddleware,
  declaracaoController.getStatusEnum
)

/**
 * @swagger
 * /api/admin/dashboard/declaraoes-status-ano:
 *   get:
 *     summary: Obtém declarações organizadas por ano para o dashboard.
 *     description: Endpoint para obter declarações organizadas por ano para exibição no dashboard.
 *     tags:
 *       - Dashboard
 *     responses:
 *       '200':
 *         description: Declarações organizadas por ano obtidas com sucesso.
 *       '500':
 *         description: Erro ao organizar declarações por ano para o dashboard.
 */
routes.get(
  "/declaraoes-status-ano",
  adminMiddleware,
  declaracaoController.getDeclaracoesPorStatusAno
)

/**
 * @swagger
 * /api/admin/dashboard/anoDeclaracao:
 *   get:
 *     summary: Obtém declarações organizadas por ano para o dashboard.
 *     description: Endpoint para obter declarações organizadas por ano para exibição no dashboard.
 *     tags:
 *       - Dashboard
 *     responses:
 *       '200':
 *         description: Declarações organizadas por ano obtidas com sucesso.
 *       '500':
 *         description: Erro ao organizar declarações por ano para o dashboard.
 */
routes.get(
  "/anoDeclaracao",
  adminMiddleware,
  declaracaoController.getDeclaracoesPorAnoDashboard
)

/**
 * @swagger
 * /api/admin/dashboard/regiao:
 *   get:
 *     summary: Obtém declarações organizadas por região para o dashboard.
 *     description: Endpoint para obter declarações organizadas por região para exibição no dashboard.
 *     tags:
 *       - Dashboard
 *     responses:
 *       '200':
 *         description: Declarações organizadas por região obtidas com sucesso.
 *       '500':
 *         description: Erro ao organizar declarações por região para o dashboard.
 */
routes.get(
  "/regiao",
  adminMiddleware,
  declaracaoController.getDeclaracoesPorRegiao
)

/**
 * @swagger
 * /api/admin/dashboard/UF:
 *   get:
 *     summary: Obtém declarações organizadas por UF para o dashboard.
 *     description: Endpoint para obter declarações organizadas por UF para exibição no dashboard.
 *     tags:
 *       - Dashboard
 *     responses:
 *       '200':
 *         description: Declarações organizadas por UF obtidas com sucesso.
 *       '500':
 *         description: Erro ao organizar declarações por UF para o dashboard.
 */
routes.get("/UF", adminMiddleware, declaracaoController.getDeclaracoesPorUF)

/**
 * @swagger
 * /api/admin/dashboard/status:
 *   get:
 *     summary: Obtém declarações organizadas por status para o dashboard.
 *     description: Endpoint para obter declarações organizadas por status para exibição no dashboard.
 *     tags:
 *       - Dashboard
 *     responses:
 *       '200':
 *         description: Declarações organizadas por status obtidas com sucesso.
 *       '500':
 *         description: Erro ao organizar declarações por status para o dashboard.
 */
routes.get(
  "/status",
  adminMiddleware,
  declaracaoController.getDeclaracoesPorStatus
)
/**
 * @swagger
 * /api/admin/dashboard/museu-itens/{museu}:
 *   get:
 *     summary: Retorna a quantidade de itens de declarações agrupados por ano e tipo para um museu específico.
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - in: path
 *         name: museu
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do museu para o qual as declarações serão buscadas.
 *     responses:
 *       200:
 *         description: Sucesso ao retornar os itens agrupados por ano e tipo.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   anoDeclaracao:
 *                     type: string
 *                     description: O ano da declaração.
 *                     example: "2021"
 *                   totalArquivistico:
 *                     type: integer
 *                     description: Total de itens arquivísticos.
 *                     example: 5
 *                   totalBibliografico:
 *                     type: integer
 *                     description: Total de itens bibliográficos.
 *                     example: 3
 *                   totalMuseologico:
 *                     type: integer
 *                     description: Total de itens museológicos.
 *                     example: 7
 *                   totalDeItensDeclaracao:
 *                     type: integer
 *                     description: Total de itens somando todos os tipos.
 *                     example: 15
 *       400:
 *         description: Parâmetro museuId não fornecido ou inválido.
 *       404:
 *         description: Nenhuma declaração encontrada para o museu fornecido.
 *       500:
 *         description: Erro ao processar a requisição.
 */

routes.get("/museu-itens/:museu",adminMiddleware,declaracaoController.getItensMuseu)

export default routes
