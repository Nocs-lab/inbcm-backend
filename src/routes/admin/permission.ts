import express from "express"
import PermissionController from "../../controllers/PermissionController"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"

const routes = express.Router()

routes.get("/",userPermissionMiddleware('getPermissions'), PermissionController.getPermissions)



export default routes
