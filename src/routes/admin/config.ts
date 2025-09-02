import express from "express"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"
import ConfigController from "../../controllers/ConfigController"

const routes = express.Router()

routes.get(
  "/email",
  userPermissionMiddleware("getEmailConfigs"),
  ConfigController.getEmailConfigs
)

routes.put(
  "/email",
  userPermissionMiddleware("updateEmailConfigs"),
  ConfigController.updateEmailConfigs
)

routes.get(
  "/portal",
  // userPermissionMiddleware("getPortalConfigs"),
  ConfigController.getPortalConfigs
)

routes.put(
  "/portal",
  // userPermissionMiddleware("updatePortalConfigs"),
  ConfigController.updatePortalConfigs
)

export default routes
