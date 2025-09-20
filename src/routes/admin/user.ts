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
routes.get(
  "/documento/:id",
  userPermissionMiddleware("UsuarioController"),
  UsuarioController.getDocumento
)
routes.put(
  "/:id",
  userPermissionMiddleware("atualizarUsuario"),
  UsuarioController.atualizarUsuario
)
routes.put(
  "/:id",
  userPermissionMiddleware("atualizarPerfilUsuario"),
  UsuarioController.atualizarPerfilUsuario
)
routes.delete(
  "/:id",
  userPermissionMiddleware("deletarUsuario"),
  UsuarioController.deletarUsuario
)
routes.post(
  "/recuperar-senha",
  UsuarioController.recuperarSenhaAdmin
)
routes.get(
  "/checar-token-recuperacao/:token",
  UsuarioController.checarTokenDeRecuperacao
)
routes.post(
  "/resetar-senha",
  UsuarioController.redefinirSenha
)

export default routes
