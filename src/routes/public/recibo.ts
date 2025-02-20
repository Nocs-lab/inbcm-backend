import express from "express"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"
import ReciboController from "../../controllers/ReciboController"

const reciboController = new ReciboController()

const routes = express.Router()
routes.get("/detalhamento/:id", reciboController.gerarReciboDetalhamento)
/**
 * @swagger
 * /api/recibo/validar/{hashDeclaracao}:
 *   get:
 *     summary: Valida um recibo com base no hash da declaração.
 *     description: Endpoint público para validar um recibo.
 *     tags:
 *       - Recibo
 *     parameters:
 *       - in: path
 *         name: hashDeclaracao
 *         description: Hash da declaração para validar o recibo.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Recibo válido.
 *       '400':
 *         description: Hash inválido.
 *       '500':
 *         description: Erro ao validar o recibo.
 */
routes.get("/validar/:hashDeclaracao", reciboController.validarRecibo)
/**
 * @swagger
 * /api/public/recibo/{idDeclaracao}:
 *   get:
 *     summary: Gera um recibo para a declaração especificada.
 *     description: Endpoint para gerar um recibo para a declaração especificada.
 *     tags:
 *       - Recibo
 *     parameters:
 *       - in: path
 *         name: idDeclaracao
 *         description: ID da declaração para a qual o recibo será gerado.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Recibo gerado com sucesso.
 *       '400':
 *         description: ID inválido.
 *       '500':
 *         description: Erro ao gerar o recibo.
 */
routes.get(
  "/:idDeclaracao",
  userPermissionMiddleware("gerarRecibo"),
  reciboController.gerarRecibo
)

routes.get("/:hashDeclaracao", reciboController.validarRecibo)

export default routes
