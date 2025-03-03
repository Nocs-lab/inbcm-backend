import express from "express"
import authRoutes from "./auth"
import dashboardRoutes from "./dashboard"
import declaracoesRoutes from "./declaracoes"
import museusRoutes from "./museus"
import profileRoutes from "./profile"
import permissionsRoutes from "./permission"
import userRoutes from "./user"
import timeLineRoutes from "./timeline"
import anoDeclaracaoRoutes from "./anodeclaracao"

const routes = express.Router()

routes.use("/auth", authRoutes)
routes.use("/declaracoes", declaracoesRoutes)
routes.use("/permissions", permissionsRoutes)
routes.use("/museus", museusRoutes)
routes.use("/profile", profileRoutes)
routes.use("/users", userRoutes)
routes.use("/dashboard", dashboardRoutes)
routes.use("/timeline", timeLineRoutes)
routes.use("/anoDeclaracao", anoDeclaracaoRoutes)

export default routes
