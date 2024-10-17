import express from "express"
import { adminMiddleware } from "../../middlewares/AuthMiddlewares"
import DeclaracaoController from "../../controllers/DeclaracaoController"

const declaracaoController = new DeclaracaoController()

const routes = express.Router()

/**
 * @swagger
 * /api/admin/dashboard:
 *  get:
 *   summary: Obtém dados para o dashboard.
 *    description: Endpoint para obter dados para exibição no dashboard.
 *    tags:
 *     - Dashboard
 *   responses:
 *    '200':
 *      description: Dados para o dashboard obtidos com sucesso.
 *    '500':
 *      description: Erro ao obter dados para o dashboard.
 * */
routes.get("/", adminMiddleware, declaracaoController.getDashboard)

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

export default routes
