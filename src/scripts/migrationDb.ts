import mongoose from "mongoose"
import { AnoDeclaracao, Declaracoes } from "../models"

async function createAnoToObjectIdMap() {
  const anoToObjectIdMap = new Map()

  try {
    const anosDeclaracao = await AnoDeclaracao.find({}, { ano: 1, _id: 1 })

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
      .populate("anoDeclaracao") // Garante que a referência seja resolvida
      .select("_id anoDeclaracao") // Seleciona apenas os campos necessários

    console.log(
      `🔄 Iniciando migração para ${declaracoes.length} declarações...`
    )
    console.log("Declarações encontradas:", declaracoes)

    for (const doc of declaracoes) {
      const { _id, anoDeclaracao } = doc

      // Verificar se o campo anoDeclaracao foi corretamente preenchido
      if (!anoDeclaracao || !anoDeclaracao._id) {
        console.warn(
          `⚠️ Declaração ${_id} tem anoDeclaracao undefined ou mal populado!`
        )
        continue // Pular para a próxima declaração se anoDeclaracao estiver faltando
      }

      // Se anoDeclaracao for um objeto (povoado), extraímos o ID
      const anoObjectId = anoDeclaracao._id || anoDeclaracao

      // Verificar se o campo já está com o ObjectId correto
      if (anoToObjectIdMap.has(anoObjectId.toString())) {
        const objectId = anoToObjectIdMap.get(anoObjectId.toString())

        if (anoObjectId !== objectId.toString()) {
          await Declaracoes.updateOne(
            { _id },
            { $set: { anoDeclaracao: objectId } }
          )

          console.log(
            `✅ Declaração ${_id} atualizada: ${anoObjectId} ➝ ${objectId}`
          )
        }
      } else {
        console.warn(
          `⚠️ Não foi possível encontrar o ObjectId para o ano: ${anoObjectId}`
        )
      }
    }

    console.log("🎉 Migração concluída com sucesso!")
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
