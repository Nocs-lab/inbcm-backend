import mongoose from "mongoose"
import config from "../config"
import logger from "../utils/logger"

async function main() {
  try {
    mongoose.set("strictQuery", true)

    await mongoose.connect(config.DB_URL!)
    logger.info("Conectado ao MongoDB!")

    const db = mongoose.connection.db

    if (!db) {
      throw new Error("Não foi possível obter a instância do banco de dados.")
    }

    const collections = await db.listCollections({ name: "log_erros" }).toArray()

    if (collections.length === 0) {
      await db.createCollection("log_erros", {
        timeseries: {
          timeField: "timestamp",
          metaField: "meta",
          granularity: "seconds"
        }
      })
      logger.info("Coleção de logs criada com sucesso!")
    }
  } catch (error) {
    logger.error(`Erro: ${error}`)
  }
}

// Exporte a função `main` como exportação padrão
export default main
