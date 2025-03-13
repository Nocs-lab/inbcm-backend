import mongoose from "mongoose"
import { AnoDeclaracao, Declaracoes } from "../models"
import config from "../config"
import logger from "../utils/logger"

async function createAnoToObjectIdMap() {
  const anoToObjectIdMap = new Map()

  try {
    const anosDeclaracao = await AnoDeclaracao.find({}, { ano: 1, _id: 1 })

    for (const doc of anosDeclaracao) {
      anoToObjectIdMap.set(doc.ano.toString(), doc._id)
    }
  } catch (error) {
    logger.error("Erro ao criar mapa de ano para ObjectId:", error)
  }

  return anoToObjectIdMap
}

async function migrateAnoDeclaracao(anoToObjectIdMap) {
  try {
    const declaracoes = await Declaracoes.find({}).lean()

    logger.info(`Iniciando migração para ${declaracoes.length} declarações...`)

    for (const doc of declaracoes) {
      const { _id, anoDeclaracao } = doc

      if (anoDeclaracao && typeof anoDeclaracao === "string") {
        const objectId = anoToObjectIdMap.get(anoDeclaracao)

        if (objectId) {
          await Declaracoes.updateOne(
            { _id },
            { $set: { anoDeclaracao: objectId } }
          )
        } else {
          logger.warn(
            `Sem ObjectId para o ano: ${anoDeclaracao} (Declaração ${_id})`
          )
        }
      } else if (anoDeclaracao === undefined) {
        logger.warn(`Declaração ${_id} tem anoDeclaracao undefined!`)
      } else {
        logger.warn(
          `anoDeclaracao não é uma string: ${anoDeclaracao} (Declaração ${_id})`
        )
      }
    }
  } catch (error) {
    logger.error("Erro durante a migração:", error)
  }
}

async function main() {
  try {
    logger.info("🔗 Conectando ao banco de dados...")

    await mongoose.connect(` ${config.DB_URL}`)

    logger.info("Conexão estabelecida!")

    const anoToObjectIdMap = await createAnoToObjectIdMap()

    await migrateAnoDeclaracao(anoToObjectIdMap)
  } catch (error) {
    logger.error("Erro no processo principal:", error)
  } finally {
    await mongoose.disconnect()
    logger.info("Conexão encerrada.")
  }
}
main()
