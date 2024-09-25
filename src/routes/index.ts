import express from "express"
import DeclaracaoController from "../controllers/DeclaracaoController"
import MuseuController from "../controllers/MuseuController"
import ReciboController from "../controllers/ReciboController"
import PermissionController from "../controllers/PermissionController";
import ProfileController from "../controllers/ProfileController";
import UsuarioController from "../controllers/UsuarioController"
import uploadMiddleware from "../middlewares/UploadMiddleware"
import rateLimit from "express-rate-limit"
import AuthService from "../service/AuthService"
import { adminMiddleware, userMiddleware, permissionCheckMiddleware } from "../middlewares/AuthMiddlewares";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30
})

const routes = express.Router()
const reciboController = new ReciboController()
const declaracaoController = new DeclaracaoController()
const authService = new AuthService()

//Permission
routes.get('/permissions', PermissionController.getPermissions);

//Profile
routes.post('/profile', permissionCheckMiddleware('createProfile'),ProfileController.createProfile);
routes.get('/profiles', userMiddleware, ProfileController.getProfiles);
routes.get('/profile/:id', permissionCheckMiddleware('getProfileById'), ProfileController.getProfileById);
routes.put('/profile/:id', permissionCheckMiddleware('updateProfile'), ProfileController.updateProfile);
routes.delete('/profile/:id', permissionCheckMiddleware('deleteProfile'), ProfileController.deleteProfile);
routes.post('/profile/addPermissions', permissionCheckMiddleware('addPermissions'), ProfileController.addPermissions);

//Usuário
routes.post('/user', UsuarioController.registerUsuario);
routes.get('/users', UsuarioController.getUsuarios);
routes.get('/usersByProfile/:profileId', UsuarioController.getUsersByProfile);
routes.get('/user/:id', UsuarioController.getUsuarioPorId);
routes.put('/user/:id', UsuarioController.atualizarUsuario);
routes.delete('/user/:id', UsuarioController.deletarUsuario);

routes.get("/analistas", adminMiddleware,declaracaoController.listarAnalistas.bind(declaracaoController));

routes.get(
  "/listar-itens/:museuId/:ano/:tipo",
  userMiddleware,
  declaracaoController.listarItensPorTipodeBem.bind(declaracaoController)
)

routes.put("/declaracoes/:id/analises",adminMiddleware, declaracaoController.enviarParaAnalise.bind(declaracaoController))


routes.put("/declaracoes/:id/analises-concluir",adminMiddleware, declaracaoController.concluirAnalise.bind(declaracaoController))
/**
 * @swagger
 * /api/criarMuseu:
 *   post:
 *     summary: Cria um novo museu.
 *     description: Endpoint para criar um novo museu.
 *     tags:
 *       - Museu
 *     parameters:
 *       - in: body
 *         name: museu
 *         description: Dados do museu a ser criado.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             nome:
 *               type: string
 *               description: Nome do museu.
 *             endereco:
 *               type: object
 *               properties:
 *                 cidade:
 *                   type: string
 *                   description: Nome da cidade onde o museu está localizado.
 *                 UF:
 *                   type: string
 *                   enum: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
 *                   description: Sigla do estado onde o museu está localizado.
 *                 logradouro:
 *                   type: string
 *                   description: Nome da rua ou logradouro onde o museu está localizado.
 *                 numero:
 *                   type: string
 *                   description: Número do endereço onde o museu está localizado.
 *                 complemento:
 *                   type: string
 *                   description: Complemento do endereço (opcional).
 *                 bairro:
 *                   type: string
 *                   description: Bairro onde o museu está localizado.
 *                 cep:
 *                   type: string
 *                   description: CEP do endereço onde o museu está localizado.
 *                 municipio:
 *                   type: string
 *                   description: Nome do município onde o museu está localizado.
 *                 uf:
 *                   type: string
 *                   description: Sigla do estado onde o museu está localizado.
 *     responses:
 *       '200':
 *         description: Museu criado com sucesso.
 *       '400':
 *         description: Erro ao criar o museu.
 */
routes.post("/criarMuseu", adminMiddleware, MuseuController.criarMuseu)

/**
 * @swagger
 * /api/listarMuseus:
 *   get:
 *     summary: Lista os museus.
 *     description: Endpoint para listar todos os museus cadastrados no sistema.
 *     tags:
 *       - Museu
 *     responses:
 *       '200':
 *         description: Lista de museus retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: {}
 *       '500':
 *         description: Erro ao listar museus.
 */
routes.get("/listarMuseus", adminMiddleware, MuseuController.listarMuseus)

/**
 * @swagger
 * /api/museus:
 *   get:
 *     summary: Lista os museus do usuário.
 *     description: Endpoint para listar os museus associados ao usuário autenticado.
 *     tags:
 *       - Museu
 *     responses:
 *       '200':
 *         description: Lista de museus do usuário retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: {}
 *       '500':
 *         description: Erro ao listar museus do usuário.
 */
routes.get("/museus", userMiddleware, MuseuController.userMuseus)

//rota declarações
/**
 * @swagger
 * /api/uploads/{museu}/{anoDeclaracao}:
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
 * /api/retificar/{museu}/{anoDeclaracao}/{idDeclaracao}:
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
 * /api/download/{museu}/{anoDeclaracao}/{tipoArquivo}:
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

//routes.get("/declaracoes/:declaracaoId/:tipoArquivo/pendencias",userMiddleware,declaracaoController.listarPendencias);

/**
 * @swagger
 * /api/declaracoes:
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
routes.get("/declaracoes", userMiddleware, declaracaoController.getDeclaracoes)

/**
 * @swagger
 * /api/declaracoes/{id}:
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
  "/declaracoes/:id",
  userMiddleware,
  declaracaoController.getDeclaracao
)

/**
 * @swagger
 * /api/declaracoes/{museu}/{anoDeclaracao}:
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
  "/declaracoes/:museu/:anoDeclaracao",
  userMiddleware,
  declaracaoController.getDeclaracaoAno
)

/**
 * @swagger
 * /api/declaracoesFiltradas:
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
 * /api/getStatusEnum:
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
 * /api/declaracoesFiltradas:
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
 * /api/atualizarStatus/{id}:
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

/**
 * @swagger
 * /api/declaracoes/pendentes:
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
  "/declaracoes/pendentes",
  adminMiddleware,
  declaracaoController.getDeclaracaoPendente
)

// routes.get("/getStatusEnum", adminMiddleware, declaracaoController.getStatusEnum);

/**
 * @swagger
 * /api/dashboard/anoDeclaracao:
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
  "/dashboard/anoDeclaracao",
  adminMiddleware,
  declaracaoController.getDeclaracoesPorAnoDashboard
)

/**
 * @swagger
 * /api/dashboard/regiao:
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
  "/dashboard/regiao",
  adminMiddleware,
  declaracaoController.getDeclaracoesPorRegiao
)

/**
 * @swagger
 * /api/dashboard/UF:
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
routes.get(
  "/dashboard/UF",
  adminMiddleware,
  declaracaoController.getDeclaracoesPorUF
)

/**
 * @swagger
 * /api/dashboard/status:
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
  "/dashboard/status",
  adminMiddleware,
  declaracaoController.getDeclaracoesPorStatus
)

//Recibo
/**
 * @swagger
 * /api/recibo/{idDeclaracao}:
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
  "/recibo/:idDeclaracao",
  userMiddleware,
  reciboController.gerarRecibo
)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login de usuário.
 *     description: Endpoint para realizar login de usuário.
 *     parameters:
 *        - in: query
 *          name: admin
 *          type: boolean
 *     requestBody:
 *       required: true
 *       content:
 *         application/*:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Login bem-sucedido.
 *       '401':
 *         description: Credenciais inválidas.
 */
routes.post("/auth/login", limiter, async (req, res) => {
  const { email, password } = req.body
  const { admin } = req.query as unknown as { admin: boolean }
  const { token, refreshToken, user } = await authService.login({
    email,
    password,
    admin: admin ?? false
  })

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 60 * 1000),
    maxAge: 60 * 60 * 1000,
    sameSite: "strict",
    secure: true,
    signed: true
  })
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "strict",
    secure: true,
    signed: true
  })

  res.json({
    name: user.nome,
    email: user.email
  })
})

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Atualiza token de acesso.
 *     description: Endpoint para atualizar o token de acesso.
 *     responses:
 *       '200':
 *         description: Token atualizado com sucesso.
 *       '401':
 *         description: Falha ao atualizar o token.
 */
routes.post("/auth/refresh", async (req, res) => {
  const { refreshToken } = req.signedCookies
  try {
    const { token } = await authService.refreshToken({ refreshToken })
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000),
      maxAge: 60 * 60 * 1000,
      sameSite: "strict",
      secure: true,
      signed: true
    })

    res.status(200).send()
  } catch (error) {
    res.status(401).send()
  }
})

export default routes
