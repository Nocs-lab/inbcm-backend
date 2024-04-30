import express from "express";
import upload from "../middlewares/UploadMiddleware";
import validarPlanilha from "../middlewares/ValidacaoMiddleware";
import validarDeclaracaoExistente from "../middlewares/DeclaracaoMiddleware";

// Importar controladores
import BibliograficoController from "../controllers/BibliograficoController";
import MuseologicoController from "../controllers/MuseologicoController";
import ArquivisticoController from "../controllers/ArquivisticoController";
import DeclaracaoController from "../controllers/DeclaracaoController";
import {ReciboController}  from "../controllers/ReciboController";
import UsuarioController from "../controllers/UsuarioController";

const routes = express.Router(); // Cria um roteador usando Express

// Instanciar controladores
const bibliograficoController = new BibliograficoController();
const museologicoController = new MuseologicoController();
const arquivisticoController = new ArquivisticoController();
const reciboController = new ReciboController();
const declaracaoController = new DeclaracaoController();

// Definir rotas de upload para cada tipo de arquivo
routes.post(
  "/bibliografico/upload/:anoDeclaracao",
  validarDeclaracaoExistente,
  upload.single("file"),
  validarPlanilha,
  bibliograficoController.uploadBibliograficoModel
);
routes.post(
  "/museologico/upload/:anoDeclaracao",
  validarDeclaracaoExistente,
  upload.single("file"),
  validarPlanilha,
  museologicoController.uploadMuseologicoModel
);
routes.post(
  "/arquivistico/upload/:anoDeclaracao",
  validarDeclaracaoExistente,
  upload.single("file"),
  validarPlanilha,
  arquivisticoController.uploadArquivisticoModel
);

// Adicionar rota de teste
routes.get("/teste/:anoDeclaracao", (req, res) => {
  const { anoDeclaracao } = req.params;
  res.send(anoDeclaracao);
});


routes.post("/recibo/gerar", upload.single("file"), ReciboController.gerarRecibo);

// Rota para buscar todas as declarações
// routes.get('/declaracoes', DeclaracoesController.mostrarDeclaracao);

routes.post("/declaracao/:anoDeclaracao", (req, res) => declaracaoController.criarDeclaracao(req, res));



// Rota para criar usuários
routes.post("/usuarios", UsuarioController.criarUsuario);

// Exportar o roteador configurado
export default routes;
