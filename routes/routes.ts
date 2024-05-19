import express from "express";
import uploadMiddleware from "../middlewares/UploadMiddleware";
//import ValidacaoMiddleware from "../middlewares/ValidacaoMiddleware";
import DeclaracaoController from "../controllers/DeclaracaoController";
import MuseuController from "../controllers/MuseuController";
//import UsuarioController from "../controllers/UsuarioController";
import ReciboController from "../controllers/ReciboController";

const routes = express.Router();
const reciboController = new ReciboController();
const declaracaoController = new DeclaracaoController();
const museuController = new MuseuController();


//Museu
routes.post('/criarMuseu', MuseuController.criarMuseu);
routes.get('/listarMuseus',MuseuController.listarMuseus);


//Declaração
routes.put(
  "/uploads/:anoDeclaracao",
  uploadMiddleware,
  // ValidacaoMiddleware,
  declaracaoController.uploadDeclaracao
);
routes.get("/declaracoes", declaracaoController.getDeclaracao);
routes.get("/declaracoes/:anoDeclaracao", declaracaoController.getDeclaracaoAno);
routes.post("/declaracoesFiltradas", declaracaoController.getDeclaracaoFiltrada);
routes.get("/getStatusEnum", declaracaoController.getStatusEnum);


//Recibo
routes.get("/recibo/:id", reciboController.gerarRecibo); // Rota para buscar todas as declarações


//Usuario
//routes.post("/usuarios", UsuarioController.criarUsuario);


export default routes;
