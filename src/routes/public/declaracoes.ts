import express from "express"
import DeclaracaoController from "../../controllers/DeclaracaoController"
import uploadMiddleware from "../../middlewares/UploadMiddleware"
import { userMiddleware } from "../../middlewares/AuthMiddlewares"

const routes = express.Router()
const declaracaoController = new DeclaracaoController()

routes.get(
  "/listar-itens/:museuId/:ano/:tipo",
  userMiddleware,
  declaracaoController.listarItensPorTipodeBem.bind(declaracaoController)
)

/**
 * @swagger
 * /api/public/declaracoes/uploads/{museu}/{anoDeclaracao}:
 *   post:
 *     summary: Envia uma declaração para o museu.
 *     description: Endpoint para enviar uma declaração para o museu especificado.
 *     tags:
 *       - Declarações
 *     parameters:
 *       - in: path
 *         name: museu
 *         description: ID do museu para o qual a declaração está sendo enviada.
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: anoDeclaracao
 *         description: Ano da declaração.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               arquivisticoArquivo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo arquivístico.
 *               bibliograficoArquivo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo bibliográfico.
 *               museologicoArquivo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo museológico.
 *               arquivistico:
 *                 type: string
 *                 description: Dados arquivísticos.
 *               bibliografico:
 *                 type: string
 *                 description: Dados bibliográficos.
 *               museologico:
 *                 type: string
 *                 description: Dados museológicos.
 *               arquivisticoErros:
 *                 type: string
 *                 description: Erros no envio dos dados arquivísticos.
 *               bibliograficoErros:
 *                 type: string
 *                 description: Erros no envio dos dados bibliográficos.
 *               museologicoErros:
 *                 type: string
 *                 description: Erros no envio dos dados museológicos.
 *     responses:
 *       '200':
 *         description: Declaração enviada com sucesso.
 *       '400':
 *         description: Museu inválido.
 *       '500':
 *         description: Erro ao enviar arquivos para a declaração.
 */
routes.post(
  "/uploads/:museu/:anoDeclaracao",
  uploadMiddleware,
  userMiddleware,
  declaracaoController.uploadDeclaracao
)

/**
 * @swagger
 * /api/public/declaracoes/retificar/{museu}/{anoDeclaracao}/{idDeclaracao}:
 *   put:
 *     summary: Retifica uma declaração existente.
 *     description: Endpoint para retificar uma declaração existente para o museu especificado.
 *     tags:
 *       - Declarações
 *     parameters:
 *       - in: path
 *         name: museu
 *         description: ID do museu ao qual a declaração pertence.
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: anoDeclaracao
 *         description: Ano da declaração a ser retificada.
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: idDeclaracao
 *         description: ID da declaração a ser retificada.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               arquivisticoArquivo:
 *                 type: string
 *                 format: binary
 *                 description: Novo arquivo arquivístico para a retificação.
 *               bibliograficoArquivo:
 *                 type: string
 *                 format: binary
 *                 description: Novo arquivo bibliográfico para a retificação.
 *               museologicoArquivo:
 *                 type: string
 *                 format: binary
 *                 description: Novo arquivo museológico para a retificação.
 *               arquivistico:
 *                 type: string
 *                 description: Novos dados arquivísticos para a retificação.
 *               bibliografico:
 *                 type: string
 *                 description: Novos dados bibliográficos para a retificação.
 *               museologico:
 *                 type: string
 *                 description: Novos dados museológicos para a retificação.
 *               arquivisticoErros:
 *                 type: string
 *                 description: Novos erros no envio dos dados arquivísticos para a retificação.
 *               bibliograficoErros:
 *                 type: string
 *                 description: Novos erros no envio dos dados bibliográficos para a retificação.
 *               museologicoErros:
 *                 type: string
 *                 description: Novos erros no envio dos dados museológicos para a retificação.
 *     responses:
 *       '200':
 *         description: Declaração retificada com sucesso.
 *       '404':
 *         description: Declaração não encontrada para o ano especificado.
 *       '500':
 *         description: Erro ao retificar declaração.
 */
routes.put(
  "/retificar/:museu/:anoDeclaracao/:idDeclaracao",
  uploadMiddleware,
  userMiddleware,
  declaracaoController.retificarDeclaracao.bind(declaracaoController)
)

/**
 * @swagger
 * /api/public/declaracoes/download/{museu}/{anoDeclaracao}/{tipoArquivo}:
 *   get:
 *     summary: Baixa um arquivo de declaração.
 *     description: Endpoint para baixar um arquivo de declaração para o museu e ano especificados.
 *     tags:
 *       - Declarações
 *     parameters:
 *       - in: path
 *         name: museu
 *         description: ID do museu ao qual a declaração pertence.
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: anoDeclaracao
 *         description: Ano da declaração do arquivo a ser baixado.
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tipoArquivo
 *         description: Tipo de arquivo a ser baixado (arquivistico, bibliografico ou museologico).
 *         required: true
 *         schema:
 *           type: string
 *           enum: [arquivistico, bibliografico, museologico]
 *     responses:
 *       '200':
 *         description: Arquivo de declaração baixado com sucesso.
 *       '404':
 *         description: Declaração não encontrada para o ano especificado ou arquivo não encontrado para o tipo especificado.
 *       '500':
 *         description: Erro ao baixar arquivo da declaração.
 */
routes.get(
  "/download/:museu/:anoDeclaracao/:tipoArquivo",
  userMiddleware,
  declaracaoController.downloadDeclaracao
)

/**
 * @swagger
 * /api/public/declaracoes:
 *   get:
 *     summary: Obtém todas as declarações do usuário.
 *     description: Endpoint para obter todas as declarações pertencentes ao usuário autenticado.
 *     tags:
 *       - Declarações
 *     responses:
 *       '200':
 *         description: Lista de todas as declarações do usuário obtida com sucesso.
 *       '500':
 *         description: Erro ao buscar declarações.
 */
routes.get("/", userMiddleware,declaracaoController.getDeclaracoes)

/**
 * @swagger
 * /api/public/declaracoes/{id}:
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
routes.get("/:id", userMiddleware, declaracaoController.getDeclaracao)

/**
 * @swagger
 * /api/public/declaracoes/{museu}/{anoDeclaracao}:
 *   get:
 *     summary: Obtém declarações por museu e ano.
 *     description: Endpoint para obter declarações de um museu específico para um ano específico.
 *     tags:
 *       - Declarações
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: museu
 *         description: ID do museu.
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: anoDeclaracao
 *         description: Ano da declaração.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Declarações obtidas com sucesso.
 *       '404':
 *         description: Declarações não encontradas para o museu e ano especificados.
 *       '500':
 *         description: Erro ao buscar declarações.
 */
routes.get(
  "/:museu/:anoDeclaracao",
  userMiddleware,
  declaracaoController.getDeclaracaoAno
)
/**
 * @swagger
 * /api/public/declaracoes/{museuId}/itens/{anoInicio}/{anoFim}:
 *   get:
 *     summary: Retorna a quantidade de itens de um museu, agrupada por ano e tipo de acervo
 *     description: Retorna a quantidade de itens declarados por ano e por tipo de acervo (arquivístico, bibliográfico, museológico) em um intervalo de anos para um museu específico.
 *     tags:
 *       - Declarações
 *     parameters:
 *       - in: path
 *         name: museuId
 *         schema:
 *           type: string
 *         required: true
 *         description: O ID do museu para o qual os dados devem ser recuperados
 *       - in: path
 *         name: anoInicio
 *         schema:
 *           type: integer
 *         required: true
 *         description: O ano de início do intervalo
 *       - in: path
 *         name: anoFim
 *         schema:
 *           type: integer
 *         required: true
 *         description: O ano final do intervalo
 *     responses:
 *       200:
 *         description: Retorna a quantidade de itens agrupados por ano e tipo de acervo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 anoDeclaracao:
 *                   type: integer
 *                   description: O ano da declaração
 *                 tipoAcervo:
 *                   type: string
 *                   description: O tipo do acervo (arquivístico, bibliográfico, museológico)
 *                 totalItens:
 *                   type: integer
 *                   description: O total de itens declarados para o ano e tipo de acervo
 *             example:
 *               - anoDeclaracao: 2022
 *                 tipoAcervo: arquivistico
 *                 totalItens: 30
 *               - anoDeclaracao: 2023
 *                 tipoAcervo: bibliografico
 *                 totalItens: 15
 *       400:
 *         description: Parâmetros insuficientes ou museu inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: O status da operação
 *                 message:
 *                   type: string
 *                   description: A mensagem de erro
 *             example:
 *               success: false
 *               message: "Museu inválido ou não pertence ao usuário"
 *       500:
 *         description: Erro no processamento da requisição
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro
 *                 error:
 *                   type: string
 *                   description: Detalhes do erro
 */
routes.get("/:museuId/itens/:anoInicio/:anoFim", userMiddleware, declaracaoController.getItensPorAnoETipo);



/**
 * @swagger
 * /api/public/declaracoes/{museuId}:
 *   delete:
 *     summary: Realiza a deleção lógica de uma declaração, caso o status seja diferente de "Recebida"
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: O ID da declaração a ser excluída.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleção lógica bem-sucedida, sem conteúdo na resposta.
 *       406:
 *         description: A declaração não pode ser excluída porque está em período de análise.
 *       404:
 *         description: Declaração não encontrada pelo ID fornecido.
 *       500:
 *         description: Erro interno ao tentar excluir a declaração.
 */
routes.delete("/:id",userMiddleware,declaracaoController.excluirDeclaracao)


export default routes
