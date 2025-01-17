import { Usuario } from "../models"
import connect from "../db/conn"
import logger from "../utils/logger"
const listUsers = async () => {
  await connect()

  const users = await Usuario.find()
  logger.info(users)
}

listUsers()
  .then(() => {
    logger.info("Usuarios listados com sucesso.")
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
