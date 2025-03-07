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

routes.post(
  "/registro",
  multer({
    limits: { fileSize: 1024 * 1024 * 1024 * 3 },
    storage: memoryStorage()
  }).single("arquivo"),
  UsuarioController.registerUsuarioExterno
)

export default routes
