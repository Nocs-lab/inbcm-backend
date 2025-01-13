import express from "express"
import publicRoutes from "./public"
import adminRoutes from "./admin"
import config from "../config"

const routes = express.Router()

routes.use((_req, res, next) => {
  res.setHeader("x-version", config.SHORT_SHA)
  next()
})

routes.use("/public", publicRoutes)
routes.use("/admin", adminRoutes)

export default routes
