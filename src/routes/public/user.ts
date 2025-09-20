import express from "express"
import UsuarioController from "../../controllers/UsuarioController"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"
import multer, { memoryStorage } from "multer"

const routes = express.Router()

routes.get(
  "/",
  userPermissionMiddleware("getUsuario"),
  UsuarioController.getUsuario
)

routes.put(
  "/:id",
  userPermissionMiddleware("atualizarPerfilUsuario"),
  UsuarioController.atualizarPerfilUsuario
)

routes.post(
  "/registro",
  multer({
    limits: { fileSize: 1024 * 1024 * 1024 * 3 },
    storage: memoryStorage()
  }).single("arquivo"),
  UsuarioController.registerUsuarioExternoDeclarant
)

routes.post(
  "/registroAnalista",
  multer({
    limits: { fileSize: 1024 * 1024 * 1024 * 3 },
    storage: memoryStorage()
  }).single("arquivo"),
  UsuarioController.registerUsuarioExternoAnalyst
)

routes.post(
  "/recuperar-senha",
  UsuarioController.recuperarSenha
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
