import express from "express";
import uploadMiddleware from "../middlewares/UploadMiddleware";
//import ValidacaoMiddleware from "../middlewares/ValidacaoMiddleware";

// Importar controladores
import DeclaracaoController from "../controllers/DeclaracaoController";
//import UsuarioController from "../controllers/UsuarioController";
import ReciboController from "../controllers/ReciboController";

const routes = express.Router(); // Cria um roteador usando Express

// Instanciar controladores
const reciboController = new ReciboController();
const declaracaoController = new DeclaracaoController();

//rota declarações
routes.put(
  "/uploads/:anoDeclaracao",
  uploadMiddleware,
  // ValidacaoMiddleware,
  declaracaoController.uploadDeclaracao
);


routes.get("/recibo/:id", reciboController.gerarRecibo);

// Rota para buscar todas as declarações
routes.get("/declaracoes", declaracaoController.getDeclaracao);
routes.get("/declaracoes/:anoDeclaracao", declaracaoController.getDeclaracaoAno);


// Rota para criar usuários
//routes.post("/usuarios", UsuarioController.criarUsuario);

// Exportar o roteador configurado
export default routes;
