import express from "express"
import ExportadorController from "../../controllers/ExportadorController"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"

const routes = express.Router()

const exportadorController = new ExportadorController()

routes.get("/", (req, res) => {
  return res.status(200).json({ message: "Rota de exportação ativa" })
})

routes.post(
  "/exportacao/:id/criar-colecoes",
  // userPermissionMiddleware("criarColecoes"),
  exportadorController.criarColecoes
)

routes.post(
  "/exportacao/:id/exportar",
  // userPermissionMiddleware("iniciarImportacao"),
  exportadorController.iniciarExportacao
)

routes.get(
  "/exportacoes",
  // userPermissionMiddleware("getExportacoes"),
  exportadorController.listarExportacoes
)

routes.get(
  "/exportacao/:id",
  // userPermissionMiddleware("getExportacao"),
  exportadorController.obterExportacao
)

routes.post(
  "/exportacao",
  userPermissionMiddleware("getEmailConfigs"),
  exportadorController.criarExportacao
)

export default routes
