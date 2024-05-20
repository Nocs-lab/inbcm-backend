import express from "express";
import uploadMiddleware from "../middlewares/UploadMiddleware";
//import ValidacaoMiddleware from "../middlewares/ValidacaoMiddleware";

// Importar controladores
import DeclaracaoController from "../controllers/DeclaracaoController";
//import UsuarioController from "../controllers/UsuarioController";
import ReciboController from "../controllers/ReciboController";
import AuthService from "../service/AuthService";

const routes = express.Router(); // Cria um roteador usando Express

// Instanciar controladores
const reciboController = new ReciboController();
const declaracaoController = new DeclaracaoController();

const authService = new AuthService()

//rota declarações
routes.put(
  "/uploads/:museu/:anoDeclaracao",
  uploadMiddleware,
  // ValidacaoMiddleware,
  declaracaoController.uploadDeclaracao
);


routes.get("/recibo/:id", reciboController.gerarRecibo);

// Rota para buscar todas as declarações
routes.get("/declaracoes", declaracaoController.getDeclaracao);
routes.get("/declaracoes/:anoDeclaracao", declaracaoController.getDeclaracaoAno);

routes.post("/auth/login", async (req, res) => {
  const { email, password } = req.body
  const { token, refreshToken, user } = await authService.login({ email, password })

  res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 60 * 60 * 1000), maxAge: 60 * 60 * 1000 })
  res.cookie("refreshToken", refreshToken, { httpOnly: true, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), maxAge: 7 * 24 * 60 * 60 * 1000 })

  res.json({
    name: user.nome,
    email: user.email
  })
})

routes.post("/auth/refresh", async (req, res) => {
  const { refreshToken } = req.cookies
  const { token } = await authService.refreshToken({ refreshToken })
  res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 60 * 60 * 1000), maxAge: 60 * 60 * 1000 })

  res.status(200).send()
})

// Rota para criar usuários
//routes.post("/usuarios", UsuarioController.criarUsuario);

// Exportar o roteador configurado
export default routes;
