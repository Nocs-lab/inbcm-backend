import "./config"
import app from "./app"
import conn from "./db/conn"
import logger from "./utils/logger"

conn()

const PORT = parseInt(process.env.PORT || "3000")

app.listen(PORT, () => logger.info(`Servidor funcionando na porta ${PORT}`))
