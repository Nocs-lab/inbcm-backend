import express from "express"
import UsuarioController from "../../controllers/UsuarioController"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"
import multer, { memoryStorage } from "multer"

const usuarioController = new UsuarioController()

const routes = express.Router()

routes.get(
  "/",
  userPermissionMiddleware("getUsuario"),
  usuarioController.getUsuario
)

routes.put(
  "/:id",
  userPermissionMiddleware("atualizarPerfilUsuario"),
  usuarioController.atualizarPerfilUsuario
)

routes.post(
  "/registro",
  multer({
    limits: { fileSize: 1024 * 1024 * 1024 * 3 },
    storage: memoryStorage()
  }).single("arquivo"),
  usuarioController.registerUsuarioExternoDeclarant
)

routes.post(
  "/registroAnalista",
  multer({
    limits: { fileSize: 1024 * 1024 * 1024 * 3 },
    storage: memoryStorage()
  }).single("arquivo"),
  usuarioController.registerUsuarioExternoAnalyst
)

routes.post(
  "/recuperar-senha",
  usuarioController.recuperarSenhaPublic
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
