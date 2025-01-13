import connect from "../db/conn"
import { Permission } from "../models/Permission"
import { Profile } from "../models/Profile" // Assumindo que Profile é o modelo que representa os perfis de usuário
import logger from "../utils/logger"
import mongoose from "mongoose" // Para o tipo ObjectId

const addPermissionsToDeclarant = async () => {
  await connect()

  // Lista de permissões a serem adicionadas
  const permissionNames = [
    "listarItensPorTipodeBem",
    "getAnosValidos",
    "uploadDeclaracao",
    "retificarDeclaracao",
    "downloadDeclaracao",
    "getDeclaracoes",
    "getDeclaracao",
    "getDeclaracaoAno",
    "getItensPorAnoETipo",
    "excluirDeclaracao",
    "userMuseus",
    "gerarRecibo",
    "getTimeLine",
    "getUsuario"
  ]

  try {
    // Encontra o perfil 'declarant'
    const declarantProfile = await Profile.findOne({ name: "declarant" })

    if (!declarantProfile) {
      logger.error("Perfil 'declarant' não encontrado.")
      process.exit(1)
    }

    // Itera sobre a lista de permissões e adiciona cada uma ao perfil
    for (const permissionName of permissionNames) {
      // Busca a permissão pelo nome
      const permission = await Permission.findOne({ name: permissionName })

      if (!permission) {
        logger.error(`Permissão "${permissionName}" não encontrada.`)
        continue // Ignora a permissão e segue para a próxima
      }

      // Verifica se a permissão já existe no perfil
      if (!declarantProfile.permissions.includes(permission._id as mongoose.Types.ObjectId)) {
        // Adiciona o ID da permissão ao array de permissões do perfil
        declarantProfile.permissions.push(permission._id as mongoose.Types.ObjectId)
        logger.info(`Permissão "${permissionName}" adicionada ao perfil 'declarant'.`)
      } else {
        logger.info(`O perfil 'declarant' já possui a permissão "${permissionName}".`)
      }
    }

    // Salva as alterações no perfil
    await declarantProfile.save()
    process.exit(0)
  } catch (error) {
    logger.error("Erro ao adicionar permissões ao perfil 'declarant':", error)
    process.exit(1)
  }
}

addPermissionsToDeclarant()
