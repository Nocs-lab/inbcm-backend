import express from "express"
import { ImportacaoController } from "../../controllers/ImportacaoController"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"

const routes = express.Router()

routes.post(
  "/start",
  userPermissionMiddleware("iniciarImportacao"),
  ImportacaoController.iniciarImportacao
)
routes.get(
  "/last",
  userPermissionMiddleware("getUltimaImportacao"),
  ImportacaoController.getUltimaImportacao
)
routes.get(
  "/museus/contagem",
  userPermissionMiddleware("getContagemMuseus"),
  ImportacaoController.getContagemMuseus
)
routes.get(
  "/:importacaoId/status",
  userPermissionMiddleware("getStatusImportacao"),
  ImportacaoController.getStatusImportacao
)

export default routes
