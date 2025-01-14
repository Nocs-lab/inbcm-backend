import connect from "../db/conn"
import { Permission } from "../models/Permission"
import { Profile } from "../models/Profile"
import logger from "../utils/logger"
import mongoose from "mongoose"
const addPermissionsToAnalyst = async () => {
  await connect()

  // Lista de permissões a serem adicionadas
  const permissionNames = [
    "listarItensPorTipodeBem",
    "downloadDeclaracao",
    "getDeclaracoes",
    "getDeclaracao",
    "getDeclaracaoAno",
    "gerarRecibo",
    "getTimeLine",
    "atualizarStatusBensDeclaracao",
    "atualizarUsuario"
  ]

  try {
    // Encontra o perfil 'analyst'
    const analystProfile = await Profile.findOne({ name: "analyst" })

    if (!analystProfile) {
      logger.error("Perfil 'analyst' não encontrado.")
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
      if (
        !analystProfile.permissions.includes(
          permission._id as mongoose.Types.ObjectId
        )
      ) {
        // Adiciona o ID da permissão ao array de permissões do perfil
        analystProfile.permissions.push(
          permission._id as mongoose.Types.ObjectId
        )
        logger.info(
          `Permissão "${permissionName}" adicionada ao perfil 'analyst'.`
        )
      } else {
        logger.info(
          `O perfil 'analyst' já possui a permissão "${permissionName}".`
        )
      }
    }

    // Salva as alterações no perfil
    await analystProfile.save()
    process.exit(0)
  } catch (error) {
    logger.error("Erro ao adicionar permissões ao perfil 'analyst':", error)
    process.exit(1)
  }
}

addPermissionsToAnalyst()
