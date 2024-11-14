import express from "express"
import {
  permissionCheckMiddleware,
  adminMiddleware
} from "../../middlewares/AuthMiddlewares"
import AnoDeclaracaoController from "../../controllers/AnoDeclaracaoController"

const routes = express.Router()

// Rota para criar um novo ano de declaração
routes.post(
  "/",adminMiddleware,
  AnoDeclaracaoController.criarAnoDeclaracao
)

// Rota para obter todos os anos de declaração
routes.get("/", adminMiddleware, AnoDeclaracaoController.getAnoDeclaracao)

// Rota para obter um ano de declaração específico por ID
routes.get(
  "/:id",
  permissionCheckMiddleware("getAnoDeclaracaoById"),
  AnoDeclaracaoController.getAnoDeclaracaoById
)

// Rota para atualizar um ano de declaração específico por ID
routes.put(
  "/:id",
  permissionCheckMiddleware("updateAnoDeclaracao"),
  AnoDeclaracaoController.updateAnoDeclaracao
)

// Rota para excluir um ano de declaração específico por ID
routes.delete(
  "/:id",
  permissionCheckMiddleware("deleteAnoDeclaracao"),
  AnoDeclaracaoController.deleteAnoDeclaracao
)

export default routes
