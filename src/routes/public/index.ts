import express from "express"
import authRoutes from "./auth"
import declaracoesRoutes from "./declaracoes"
import museusRoutes from "./museus"
import permissionsRoutes from "./permissions"
import reciboRoutes from "./recibo"
import timeLineRoutes from "./timeline"
import userRoutes from "./user"
import periodosRoutes from "./anodeclaracao"

const routes = express.Router()

routes.use("/periodos", periodosRoutes)
routes.use("/auth", authRoutes)
routes.use("/declaracoes", declaracoesRoutes)
routes.use("/museus", museusRoutes)
routes.use("/permissions", permissionsRoutes)
routes.use("/recibo", reciboRoutes)
routes.use("/timeline", timeLineRoutes)
routes.use("/users", userRoutes)

export default routes
