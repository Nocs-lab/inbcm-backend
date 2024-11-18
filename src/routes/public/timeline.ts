import express from "express"
import DeclaracaoController from "../../controllers/DeclaracaoController"
import { userMiddleware } from "../../middlewares/AuthMiddlewares"

const routes = express.Router()
const declaracaoController = new DeclaracaoController()

/**
 * @swagger
 * /api/public/timeline/{id}:
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
  userMiddleware,
  declaracaoController.getTimeLine.bind(declaracaoController)
)
export default routes
