import { Profile } from "../models/Profile"
import connect from "../db/conn"
import logger from "../utils/logger"

const createProfiles = async () => {
  await connect()

  try {
    logger.info("Conexão com o banco de dados estabelecida.")

    // Verifica e cria o perfil "admin"
    const adminExists = await Profile.findOne({ name: "admin" })
    if (!adminExists) {
      const adminProfile = new Profile({
        name: "admin",
        description: "Administrator do sistema.",
        permissions: [],
        isProtected: true
      })
      await adminProfile.save()
      logger.info('Perfil "admin" criado com sucesso.')
    } else {
      logger.info('Perfil "admin" já existe. Nenhuma ação necessária.')
    }

    // Verifica e cria o perfil "declarant"
    const declarantExists = await Profile.findOne({ name: "declarant" })
    if (!declarantExists) {
      const declarantProfile = new Profile({
        name: "declarant",
        description: "Perfil para usuários declaradores de bens.",
        permissions: [],
        isProtected: true
      })
      await declarantProfile.save()
      logger.info('Perfil "declarant" criado com sucesso.')
    } else {
      logger.info('Perfil "declarant" já existe. Nenhuma ação necessária.')
    }

    // Verifica e cria o perfil "analyst"
    const analystExists = await Profile.findOne({ name: "analyst" })
    if (!analystExists) {
      const analystProfile = new Profile({
        name: "analyst",
        description: "Perfil para analistas do sistema.",
        permissions: [],
        isProtected: true
      })
      await analystProfile.save()
      logger.info('Perfil "analyst" criado com sucesso.')
    } else {
      logger.info('Perfil "analyst" já existe. Nenhuma ação necessária.')
    }
  } catch (error) {
    logger.error("Erro ao criar os perfis:", { error })
    throw error
  }
}

createProfiles()
  .then(() => {
    logger.info("Criação de perfis concluída com sucesso.")
    process.exit(0)
  })
  .catch((err) => {
    logger.error("Erro fatal durante a criação dos perfis:", { err })
    process.exit(1)
  })
