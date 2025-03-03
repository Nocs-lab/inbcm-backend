import express from "express"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"
import AnoDeclaracaoController from "../../controllers/AnoDeclaracaoController"

const routes = express.Router()

/**
 * @swagger
 * /api/ano-declaracao:
 *   get:
 *     summary: Obtém todos os anos de declaração.
 *     description: Endpoint para listar todos os anos de declaração cadastrados. É possível enviar um parâmetro opcional para limitar a quantidade de anos retornados.
 *     tags:
 *       - Anos de Declaração
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: quantidadeAnoDeclaracao
 *         schema:
 *           type: integer
 *           description: Quantidade máxima de anos de declaração a serem retornados.
 *           example: 5
 *         required: false
 *         description: Parâmetro opcional para limitar o número de anos retornados.
 *     responses:
 *       '200':
 *         description: Lista de anos de declaração obtida com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID do ano de declaração.
 *                   ano:
 *                     type: integer
 *                     description: Ano da declaração.
 *       '400':
 *         description: O parâmetro `quantidadeAnoDeclaracao` é inválido.
 *       '500':
 *         description: Erro ao obter os anos de declaração.
 */
routes.get(
  "/",
  userPermissionMiddleware("getPeriodos"),
  AnoDeclaracaoController.getAnoDeclaracao
)

/**
 * @swagger
 * /api/ano-declaracao/getPeriodoDeclaracaoVigente:
 *   get:
 *     summary: Lista os anos de declaração com período vigente.
 *     description: Endpoint para obter os anos de declaração cujo período de submissão está vigente, ou seja, a data atual está entre `dataInicioSubmissao` e `dataFimSubmissao`.
 *     tags:
 *       - Anos de Declaração
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de anos de declaração com períodos vigentes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID do ano de declaração.
 *                   ano:
 *                     type: integer
 *                     description: Ano da declaração.
 *                   dataInicioSubmissao:
 *                     type: string
 *                     format: date
 *                     description: Data de início para submissão.
 *                   dataFimSubmissao:
 *                     type: string
 *                     format: date
 *                     description: Data de fim para submissão.
 *                   dataInicioRetificacao:
 *                     type: string
 *                     format: date
 *                     description: Data de início para retificação.
 *                   dataFimRetificacao:
 *                     type: string
 *                     format: date
 *                     description: Data de fim para retificação.
 *                   metaDeclaracoesEnviadas:
 *                     type: integer
 *                     description: Meta de declarações.
 *       '500':
 *         description: Erro ao listar os períodos vigentes.
 */
routes.get(
  "/getPeriodoDeclaracaoVigente",
  AnoDeclaracaoController.getPeriodoDeclaracaoVigente
)

export default routes
