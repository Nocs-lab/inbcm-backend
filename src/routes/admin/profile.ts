import express from "express"
import {
  userPermissionMiddleware,
} from "../../middlewares/AuthMiddlewares"
import ProfileController from "../../controllers/ProfileController"

const routes = express.Router()

routes.get("/", userPermissionMiddleware('getProfiles'), ProfileController.getProfiles)

routes.post(
  "/",
  userPermissionMiddleware("createProfile"),
  ProfileController.createProfile
)

routes.get(
  "/:id",
  userPermissionMiddleware("getProfileById"),
  ProfileController.getProfileById
)
routes.put(
  "/:id",
  userPermissionMiddleware("updateProfile"),
  ProfileController.updateProfile
)
routes.delete(
  "/:id",
  userPermissionMiddleware("deleteProfile"),
  ProfileController.deleteProfile
)
routes.post(
  "/addPermissions",
  userPermissionMiddleware("addPermissions"),
  ProfileController.addPermissions
)

export default routes
