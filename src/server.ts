import "./config"
import app from "./app"
import conn from "./db/conn"
import logger from "./utils/logger"
import pulse from "./lib/pulse"
import "./jobs/checkExportStatus"

conn()

const PORT = parseInt(process.env.PORT || "3000")

app.listen(PORT, async () => {
  logger.info(`Servidor funcionando na porta ${PORT}`)
  
  try {
    await pulse.start()
    await pulse.every("1 minute", "checkExportStatus")
  } catch (error) {
    logger.error("Failed to initialize Pulse or schedule jobs", error)
  }
})
