import express from "express"
import { userPermissionMiddleware } from "../../middlewares/AuthMiddlewares"
import { createSigner } from "fast-jwt"
import config from "../../config"

const signSync = createSigner({ key: config.METABASE_SECRET_KEY })

const routes = express.Router()

routes.get("/", userPermissionMiddleware("viewDashboard"), (_, res) => {
  const token = signSync({
    resource: { dashboard: config.METABASE_DASHBOARD_ID },
    params: {},
    exp: Math.round(Date.now() / 1000) + 3600
  })

  res.json({ token })
})

export default routes
