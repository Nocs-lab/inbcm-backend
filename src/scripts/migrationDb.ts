import mongoose from "mongoose"
import { AnoDeclaracao, Declaracoes } from "../models"

async function createAnoToObjectIdMap() {
  const anoToObjectIdMap = new Map()

  try {
    const anosDeclaracao = await AnoDeclaracao.find({}, { ano: 1, _id: 1 })
    console.log("Dados dos anos encontrados:", anosDeclaracao)

    // Popula o mapa com os anos e seus ObjectIds
    for (const doc of anosDeclaracao) {
      anoToObjectIdMap.set(doc.ano.toString(), doc._id)
    }

    console.log("✅ Mapa de anos criado com sucesso!", anoToObjectIdMap)
  } catch (error) {
    console.error("Erro ao criar o mapa de anos:", error)
  }

  return anoToObjectIdMap
}

async function migrateAnoDeclaracao(anoToObjectIdMap) {
  try {
    const declaracoes = await Declaracoes.find({})

    console.log(
      `🔄 Iniciando migração para ${declaracoes.length} declarações...`
    )

    const bulkOps = [] // Para armazenar as operações de atualização em massa

    for (const doc of declaracoes) {
      const { _id, anoDeclaracao } = doc

      // Verificar se o campo anoDeclaracao está preenchido corretamente
      if (!anoDeclaracao) {
        console.warn(
          `⚠️ Declaração ${_id} tem anoDeclaracao undefined ou mal preenchido!`
        )
        continue // Pular para a próxima declaração se anoDeclaracao estiver faltando
      }

      // Verificar se anoDeclaracao é uma string e se o mapa contém esse ano
      if (
        typeof anoDeclaracao === "string" &&
        anoToObjectIdMap.has(anoDeclaracao)
      ) {
        const objectId = anoToObjectIdMap.get(anoDeclaracao) // Obter o ObjectId para o ano

        // Adicionar operação de atualização no array bulkOps
        bulkOps.push({
          updateOne: {
            filter: { _id },
            update: { $set: { anoDeclaracao: objectId } },
            upsert: false
          }
        })

        console.log(
          `✅ Declaração ${_id} será atualizada: ${anoDeclaracao} ➝ ${objectId}`
        )
      } else {
        console.warn(
          `⚠️ Não foi possível encontrar o ObjectId para o ano: ${anoDeclaracao}`
        )
      }
    }

    // Executar todas as atualizações em massa
    if (bulkOps.length > 0) {
      await Declaracoes.bulkWrite(bulkOps)
      console.log("🎉 Migração concluída com sucesso!")
    } else {
      console.log("⚠️ Nenhuma declaração foi atualizada.")
    }
  } catch (error) {
    console.error("❌ Erro durante a migração:", error)
  }
}

async function main() {
  try {
    console.log("🔗 Conectando ao banco de dados...")
    await mongoose.connect(
      "mongodb://root:asdf1234@mongo:27017/INBCM?authSource=admin"
    )

    console.log("✅ Conexão estabelecida!")

    const anoToObjectIdMap = await createAnoToObjectIdMap()
    await migrateAnoDeclaracao(anoToObjectIdMap)
  } catch (error) {
    console.error("❌ Erro no processo principal:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Conexão encerrada.")
  }
}

main()
