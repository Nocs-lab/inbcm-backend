import express from "express"
import { adminMiddleware } from "../../middlewares/AuthMiddlewares"
import PermissionController from "../../controllers/PermissionController"

const routes = express.Router()

routes.get("/", adminMiddleware, PermissionController.getPermissions)



export default routes
