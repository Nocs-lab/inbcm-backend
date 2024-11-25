import "express-async-errors"
import express from "express"
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
import logger from "./utils/logger"

const app = express()

app.set("trust proxy", process.env.NODE_ENV === "production")

app.use(helmet())
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  })
)
app.use(express.json())
app.use(cookieParser(config.JWT_SECRET))
app.use(msgpack())
app.use(compression())
app.use("/api", routes)
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
