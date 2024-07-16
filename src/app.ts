import "express-async-errors"
import express, { type ErrorRequestHandler } from "express"
import routes from "./routes"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import msgpack from "./msgpack"
import compression from "compression"
import config from "./config"
import swaggerUi from "swagger-ui-express"
import swaggerSpec from "./swagger"
import * as OpenApiValidator from "express-openapi-validator"
import sanitizeMongo from "./middlewares/sanitizers/mongo"
import sanitizeHtml from "./middlewares/sanitizers/html"

const errorHandling: ErrorRequestHandler = (err, _req, res, _next) => {
  res.status(500).json({
    msg: err.message,
    success: false
  })
}

const app = express()

app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser(config.JWT_SECRET))
app.use(msgpack())
app.use(compression())
app.use("/api", routes)
app.use(errorHandling)
app.use(sanitizeMongo())
app.use(sanitizeHtml())

//Swagger
app.use("/api-docs", swaggerUi.serve)
app.get("/api-docs", swaggerUi.setup(swaggerSpec))

app.use(
  OpenApiValidator.middleware({
    apiSpec: "./openapi.yaml",
    validateRequests: true,
    validateApiSpec: false,
    ignorePaths: () => [
      "/api/uploads/{museu}/{anoDeclaracao}",
      "/retificar/:museu/:anoDeclaracao/:idDeclaracao"
    ]
  })
)

export default app
