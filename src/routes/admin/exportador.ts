import express from "express"
import ExportadorController from "../../controllers/ExportadorController"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"

const routes = express.Router()

routes.post(
  "/start",
  userPermissionMiddleware("iniciarImportacao"),
  ExportadorController.iniciarImportacao
)

export default routes
