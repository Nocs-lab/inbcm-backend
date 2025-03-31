import express from "express"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"
import EmailConfigController from "../../controllers/EmailConfigController"

const routes = express.Router()

routes.get(
  "/",
  userPermissionMiddleware("getEmailConfigs"),
  EmailConfigController.getEmailConfigs
)

routes.put(
  "/",
  userPermissionMiddleware("updateEmailConfigs"),
  EmailConfigController.updateEmailConfigs
)

export default routes
