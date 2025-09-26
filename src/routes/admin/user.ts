import express from "express"
import UsuarioController from "../../controllers/UsuarioController"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"

const usuarioController = new UsuarioController()

const routes = express.Router()

routes.post(
  "/",
  userPermissionMiddleware("registerUsuario"),
  usuarioController.registerUsuario
)
routes.get(
  "/",
  userPermissionMiddleware("getUsuarios"),
  usuarioController.getUsuarios
)
routes.get(
  "/by-profile/:profileId",
  userPermissionMiddleware("getUsersByProfile"),
  usuarioController.getUsersByProfile
)
routes.get(
  "/:id",
  userPermissionMiddleware("UsuarioController"),
  usuarioController.getUsuarioPorId
)
routes.get(
  "/documento/:id",
  userPermissionMiddleware("UsuarioController"),
  usuarioController.getDocumento
)
routes.put(
  "/:id",
  userPermissionMiddleware("atualizarUsuario"),
  usuarioController.atualizarUsuario
)
routes.put(
  "/:id",
  userPermissionMiddleware("atualizarPerfilUsuario"),
  usuarioController.atualizarPerfilUsuario
)
routes.delete(
  "/:id",
  userPermissionMiddleware("deletarUsuario"),
  usuarioController.deletarUsuario
)
routes.post(
  "/recuperar-senha",
  usuarioController.recuperarSenhaAdmin
)
routes.get(
  "/checar-token-recuperacao/:token",
  usuarioController.checarTokenDeRecuperacao
)
routes.post(
  "/redefinir-senha",
  usuarioController.redefinirSenha
)

export default routes
