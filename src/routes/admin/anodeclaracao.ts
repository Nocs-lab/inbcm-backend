import express from "express"
import {
  permissionCheckMiddleware,
  adminMiddleware
} from "../../middlewares/AuthMiddlewares"
import AnoDeclaracaoController from "../../controllers/AnoDeclaracaoController"

const routes = express.Router()

/**
 * @swagger
 * /api/ano-declaracao:
 *   post:
 *     summary: Cria um novo ano de declaração.
 *     description: Endpoint para criar um novo ano de declaração. Valida se já existe um ano de declaração cadastrado com o mesmo ano.
 *     tags:
 *       - Anos de Declaração
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ano:
 *                 type: integer
 *                 description: Ano da declaração.
 *                 example: 2024
 *               dataInicioSubmissao:
 *                 type: string
 *                 format: date
 *                 description: Data de início para a submissão das declarações.
 *                 example: "2024-01-01"
 *               dataFimSubmissao:
 *                 type: string
 *                 format: date
 *                 description: Data de fim para a submissão das declarações.
 *                 example: "2024-03-31"
 *               dataInicioRetificacao:
 *                 type: string
 *                 format: date
 *                 description: Data de início para a retificação das declarações.
 *                 example: "2024-04-01"
 *               dataFimRetificacao:
 *                 type: string
 *                 format: date
 *                 description: Data de fim para a retificação das declarações.
 *                 example: "2024-05-31"
 *               metaDeclaracoesEnviadas:
 *                 type: integer
 *                 description: Meta de declarações a serem enviadas.
 *                 example: 500
 *     responses:
 *       '201':
 *         description: Ano de declaração criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID do ano de declaração criado.
 *                 ano:
 *                   type: integer
 *                   description: Ano da declaração criado.
 *                 dataInicioSubmissao:
 *                   type: string
 *                   format: date
 *                   description: Data de início para submissão.
 *                 dataFimSubmissao:
 *                   type: string
 *                   format: date
 *                   description: Data de fim para submissão.
 *                 dataInicioRetificacao:
 *                   type: string
 *                   format: date
 *                   description: Data de início para retificação.
 *                 dataFimRetificacao:
 *                   type: string
 *                   format: date
 *                   description: Data de fim para retificação.
 *                 metaDeclaracoesEnviadas:
 *                   type: integer
 *                   description: Meta de declarações.
 *       '400':
 *         description: Dados inválidos fornecidos ou ano de declaração já cadastrado.
 *       '500':
 *         description: Erro ao criar o ano de declaração.
 */
routes.post("/", adminMiddleware, AnoDeclaracaoController.criarAnoDeclaracao)


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
routes.get("/", adminMiddleware, AnoDeclaracaoController.getAnoDeclaracao)


/**
 * @swagger
 * /api/ano-declaracao/{id}:
 *   get:
 *     summary: Obtém um ano de declaração por ID.
 *     description: Endpoint para obter os dados de um ano de declaração específico.
 *     tags:
 *       - Anos de Declaração
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do ano de declaração.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Ano de declaração obtido com sucesso.
 *       '404':
 *         description: Ano de declaração não encontrado.
 */
routes.get(
  "/:id",
  permissionCheckMiddleware("getAnoDeclaracaoById"),
  AnoDeclaracaoController.getAnoDeclaracaoById
)

/**
 * @swagger
 * /api/ano-declaracao/{id}:
 *   put:
 *     summary: Atualiza um ano de declaração por ID.
 *     description: Endpoint para atualizar os dados de um ano de declaração específico. O campo `ano` não pode ser alterado.
 *     tags:
 *       - Anos de Declaração
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do ano de declaração.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dataInicioSubmissao:
 *                 type: string
 *                 format: date
 *                 description: Nova data de início para a submissão das declarações.
 *                 example: "2025-01-01"
 *               dataFimSubmissao:
 *                 type: string
 *                 format: date
 *                 description: Nova data de fim para a submissão das declarações.
 *                 example: "2025-03-31"
 *               dataInicioRetificacao:
 *                 type: string
 *                 format: date
 *                 description: Nova data de início para a retificação das declarações.
 *                 example: "2025-04-01"
 *               dataFimRetificacao:
 *                 type: string
 *                 format: date
 *                 description: Nova data de fim para a retificação das declarações.
 *                 example: "2025-05-31"
 *               metaDeclaracoesEnviadas:
 *                 type: integer
 *                 description: Nova meta de declarações a serem enviadas.
 *                 example: 600
 *     responses:
 *       '200':
 *         description: Ano de declaração atualizado com sucesso.
 *       '400':
 *         description: Dados inválidos fornecidos.
 *       '404':
 *         description: Ano de declaração não encontrado.
 *       '500':
 *         description: Erro ao atualizar o ano de declaração.
 */
routes.put(
  "/:id",
  permissionCheckMiddleware("updateAnoDeclaracao"),
  AnoDeclaracaoController.updateAnoDeclaracao
)


/**
 * @swagger
 * /api/ano-declaracao/{id}:
 *   delete:
 *     summary: Exclui um ano de declaração por ID.
 *     description: Endpoint para excluir um ano de declaração específico.
 *     tags:
 *       - Anos de Declaração
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do ano de declaração.
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Ano de declaração excluído com sucesso.
 *       '404':
 *         description: Ano de declaração não encontrado.
 */
routes.delete(
  "/:id",
  permissionCheckMiddleware("deleteAnoDeclaracao"),
  AnoDeclaracaoController.deleteAnoDeclaracao
)

export default routes
