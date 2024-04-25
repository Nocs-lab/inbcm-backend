import express from "express";
import upload from "../middlewares/UploadMiddleware";

// Importar controladores
import BibliograficoController from "../controllers/BibliograficoController";
import MuseologicoController from "../controllers/MuseologicoController";
import ArquivisticoController from "../controllers/ArquivisticoController";
import DeclaracoesController from "../controllers/DeclaracaoController";
import {ReciboController}  from "../controllers/ReciboController"; 

const routes = express.Router(); // Cria um roteador usando Express

// Instanciar controladores
const bibliograficoController = new BibliograficoController();
const museologicoController = new MuseologicoController();
const arquivisticoController = new ArquivisticoController();
const reciboController = new ReciboController();

// Definir rotas de upload para cada tipo de arquivo
routes.post(
  "/bibliografico/upload",
  upload.single("file"),
  bibliograficoController.uploadBibliograficoModel,
);
routes.post(
  "/museologico/upload",
  upload.single("file"),
  museologicoController.uploadMuseologicoModel,
);
routes.post(
  "/arquivistico/upload",
  upload.single("file"),
  arquivisticoController.uploadArquivisticoModel,
);

// Adicionar rota de teste
routes.get("/teste", (req, res) => {
  res.send("Rota de teste funcionando!");
});
routes.post("/recibo/gerar", upload.single("file"), ReciboController.gerarRecibo);
// Rota para buscar todas as declarações
routes.get('/declaracoes', DeclaracoesController.getDeclaracoes);

// Exportar o roteador configurado
export default routes;
