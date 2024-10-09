import express from "express"
import DeclaracaoController from "../../controllers/DeclaracaoController"
import { adminMiddleware } from "../../middlewares/AuthMiddlewares"

const routes = express.Router()
const declaracaoController = new DeclaracaoController()

/**
 * @swagger
 * /api/admin/declaracoes/pendentes:
 *   get:
 *     summary: Obtém declarações pendentes.
 *     description: Endpoint para obter declarações pendentes para processamento.
 *     tags:
 *       - Declarações
 *     responses:
 *       '200':
 *         description: Declarações pendentes obtidas com sucesso.
 *       '500':
 *         description: Erro ao buscar declarações pendentes.
 */
routes.get(
  "/pendentes",
  adminMiddleware,
  declaracaoController.getDeclaracaoPendente
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
 * /api/admin/decvlaracoes/declaracoesFiltradas:
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

export default routes
