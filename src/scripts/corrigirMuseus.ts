import connect from "../db/conn"
import { Museu } from "../models/Museu"
import logger from "../utils/logger"

const corrigirMuseus = async () => {
  await connect()

  try {
    const result = await Museu.updateMany(
      { usuario: { $exists: true, $not: { $type: "array" } } },
      [
        {
          $set: {
            usuario: {
              $cond: {
                if: { $eq: [{ $type: "$usuario" }, "array"] },
                then: "$usuario",
                else: ["$usuario"]
              }
            }
          }
        }
      ]
    )

    logger.info(`Documentos corrigidos: ${result.modifiedCount}`)
    process.exit(0)
  } catch (error) {
    logger.error("Erro ao corrigir documentos na coleção 'museus':", error)
    process.exit(1)
  }
}

corrigirMuseus()
