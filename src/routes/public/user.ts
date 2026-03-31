import express from "express"
import UsuarioController from "../../controllers/UsuarioController"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"
import multer, { memoryStorage } from "multer"
import { validate } from "../../middlewares/validate.middleware"
import {
  registerExternalDeclarantSchema,
  registerExternalAnalystSchema,
  atualizarPerfilUsuarioSchema,
  recuperarSenhaSchema,
  redefinirSenhaSchema
} from "../../validators/user"

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
  validate(atualizarPerfilUsuarioSchema),
  usuarioController.atualizarPerfilUsuario
)

routes.post(
  "/registro",
  multer({
    limits: { fileSize: 1024 * 1024 * 1024 * 3 },
    storage: memoryStorage()
  }).single("arquivo"),
  validate(registerExternalDeclarantSchema),
  usuarioController.registerUsuarioExternoDeclarant
)

routes.post(
  "/registroAnalista",
  multer({
    limits: { fileSize: 1024 * 1024 * 1024 * 3 },
    storage: memoryStorage()
  }).single("arquivo"),
  validate(registerExternalAnalystSchema),
  usuarioController.registerUsuarioExternoAnalyst
)

routes.post(
  "/recuperar-senha",
  validate(recuperarSenhaSchema),
  usuarioController.recuperarSenhaPublic
)

routes.get(
  "/checar-token-recuperacao/:token",
  usuarioController.checarTokenDeRecuperacao
)

routes.post(
  "/redefinir-senha",
  validate(redefinirSenhaSchema),
  usuarioController.redefinirSenha
)

export default routes
