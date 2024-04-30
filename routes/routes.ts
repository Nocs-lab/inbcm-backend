import express from "express";
import UploadMiddleware from "../middlewares/UploadMiddleware";
import ValidacaoMiddleware from "../middlewares/ValidacaoMiddleware";
import DeclaracaoMiddleware from "../middlewares/DeclaracaoMiddleware";

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
  DeclaracaoMiddleware,
  UploadMiddleware.single("file"),
  ValidacaoMiddleware,
  bibliograficoController.uploadBibliograficoModel
);
routes.post(
  "/museologico/upload/:anoDeclaracao",
  DeclaracaoMiddleware,
  UploadMiddleware.single("file"),
  ValidacaoMiddleware,
  museologicoController.uploadMuseologicoModel
);
routes.post(
  "/arquivistico/upload/:anoDeclaracao",
  DeclaracaoMiddleware,
  UploadMiddleware.single("file"),
  ValidacaoMiddleware,
  arquivisticoController.uploadArquivisticoModel
);

// Adicionar rota de teste
routes.get("/teste/:anoDeclaracao", (req, res) => {
  const { anoDeclaracao } = req.params;
  res.send(anoDeclaracao);
});

routes.post("/recibo/gerar", upload.single("file"), ReciboController.gerarRecibo);

// Rota para buscar todas as declarações
//routes.get('/declaracoes', DeclaracaoController.getDeclaracoes);


routes.post("/declaracao/gerar", (req, res) => declaracaoController.criarDeclaracao(req, res));



// Rota para criar usuários
routes.post("/usuarios", UsuarioController.criarUsuario);

// Exportar o roteador configurado
export default routes;
