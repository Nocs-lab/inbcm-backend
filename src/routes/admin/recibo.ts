import ReciboController from "../../controllers/ReciboController"
import { adminMiddleware } from "../../middlewares/AuthMiddlewares"
import express from "express"
const reciboController = new ReciboController()
const routes = express.Router()
/**
 * @swagger
 * /api/admin/recibo/{idDeclaracao}:
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
routes.get("/:idDeclaracao", adminMiddleware, reciboController.gerarRecibo)
