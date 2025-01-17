import mongoose from "mongoose"
import config from "../config"
import logger from "../utils/logger"

async function main() {
  try {
    mongoose.set("strictQuery", true)

    await mongoose.connect(config.DB_URL!)
    logger.info("Conectado ao MongoDB!")
  } catch (error) {
    logger.error(`Erro: ${error}`)
  }
}

// Exporte a função `main` como exportação padrão
export default main
