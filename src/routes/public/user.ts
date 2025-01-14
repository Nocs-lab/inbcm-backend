import express from "express"
import UsuarioController from "../../controllers/UsuarioController"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"

const routes = express.Router()

routes.get(
  "/",
  userPermissionMiddleware("getUsuario"),
  UsuarioController.getUsuario
)

export default routes
