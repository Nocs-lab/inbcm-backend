import express from "express";
import fs from 'fs';
import UploadMiddleware from "../middlewares/UploadMiddleware";
import ValidacaoMiddleware from "../middlewares/ValidacaoMiddleware";
import DeclaracaoMiddleware from "../middlewares/DeclaracaoMiddleware";

// Importar controladores
import BibliograficoController from "../controllers/BibliograficoController";
import MuseologicoController from "../controllers/MuseologicoController";
import ArquivisticoController from "../controllers/ArquivisticoController";
import DeclaracaoController from "../controllers/DeclaracaoController";
import UsuarioController from "../controllers/UsuarioController";
import ReciboController from "../controllers/ReciboController";
const routes = express.Router(); // Cria um roteador usando Express

// Instanciar controladores
const bibliograficoController = new BibliograficoController();
const museologicoController = new MuseologicoController();
const arquivisticoController = new ArquivisticoController();
const reciboController = new ReciboController();
const declaracaoController = new DeclaracaoController();

// Definir rotas de upload para cada tipo de arquivo
routes.put(
  "/bibliografico/upload/:anoDeclaracao",
  DeclaracaoMiddleware,
  UploadMiddleware.single("file"),
  ValidacaoMiddleware,
  bibliograficoController.atualizarBibliografico
);
routes.put(
  "/museologico/upload/:anoDeclaracao",
  DeclaracaoMiddleware,
  UploadMiddleware.single("file"),
  ValidacaoMiddleware,
  museologicoController.atualizarMuseologico
);
routes.put(
  "/arquivistico/upload/:anoDeclaracao",
  DeclaracaoMiddleware,
  UploadMiddleware.single("file"),
  ValidacaoMiddleware,
  arquivisticoController.atualizarArquivistico
);

// Adicionar rota de teste
// routes.get("/teste/:anoDeclaracao", (req, res) => {
//   const { anoDeclaracao } = req.params;
//   res.send(anoDeclaracao);
// });


routes.get("/recibo/:id", reciboController.gerarRecibo);



routes.post("/declaracao/gerar", (req, res) => declaracaoController.criarDeclaracao(req, res));

// Rota para buscar todas as declarações
routes.get("/declaracoes", declaracaoController.getDeclaracao);
routes.get("/declaracoes/:anoDeclaracao", declaracaoController.getDeclaracaoAno);


// Rota para criar usuários
//routes.post("/usuarios", UsuarioController.criarUsuario);

// Exportar o roteador configurado
export default routes;
