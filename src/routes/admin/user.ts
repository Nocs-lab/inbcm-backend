import express from "express"
import UsuarioController from "../../controllers/UsuarioController"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"

const routes = express.Router()

routes.post(
  "/",
  userPermissionMiddleware("registerUsuario"),
  UsuarioController.registerUsuario
)
routes.get(
  "/",
  userPermissionMiddleware("getUsuarios"),
  UsuarioController.getUsuarios
)
routes.get(
  "/by-profile/:profileId",
  userPermissionMiddleware("getUsersByProfile"),
  UsuarioController.getUsersByProfile
)
routes.get(
  "/:id",
  userPermissionMiddleware("UsuarioController"),
  UsuarioController.getUsuarioPorId
)
routes.put(
  "/:id",
  userPermissionMiddleware("atualizarUsuario"),
  UsuarioController.atualizarUsuario
)
routes.delete(
  "/:id",
  userPermissionMiddleware("deletarUsuario"),
  UsuarioController.deletarUsuario
)

export default routes
