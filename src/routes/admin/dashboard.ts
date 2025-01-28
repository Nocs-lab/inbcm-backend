import express from "express"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"
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
  userPermissionMiddleware("getStatusEnum"),
  declaracaoController.getStatusEnum
)

/**
 * @swagger
 * /api/admin/dashboard/filtroDashBoard:
 *   get:
 *     summary: Filtra dados para o dashboard.
 *     description: Endpoint para aplicar filtros e obter dados específicos para exibição no dashboard.
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - in: query
 *         name: anos
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Lista de anos para filtrar os dados.
 *         example: ["2023", "2024"]
 *       - in: query
 *         name: estados
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Lista de estados para filtrar os dados.
 *         example: ["SP", "RJ"]
 *       - in: query
 *         name: cidades
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Lista de cidades para filtrar os dados.
 *         example: ["São Paulo", "Rio de Janeiro"]
 *       - in: query
 *         name: museu
 *         schema:
 *           type: string
 *         description: ID do museu no formato ObjectId para filtrar os dados.
 *         example: "64e7b0f0f5a9141b3c3a7e8c"
 *     responses:
 *       '200':
 *         description: Dados filtrados para o dashboard obtidos com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID da declaração.
 *                   ano:
 *                     type: string
 *                     description: Ano da declaração.
 *                   estado:
 *                     type: string
 *                     description: Estado associado à declaração.
 *                   cidade:
 *                     type: string
 *                     description: Cidade associada à declaração.
 *                   museu:
 *                     type: string
 *                     description: ID do museu associado à declaração.
 *       '400':
 *         description: Erro de validação nos parâmetros fornecidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Código do erro.
 *                 field:
 *                   type: string
 *                   description: Campo relacionado ao erro.
 *                 message:
 *                   type: string
 *                   description: Detalhes sobre o erro ocorrido.
 *       '500':
 *         description: Erro ao processar a solicitação no servidor.
 */
routes.get(
  "/filtroDashBoard",
  userPermissionMiddleware("filtroDashBoard"),
  declaracaoController.filtroDashBoard
)

export default routes
