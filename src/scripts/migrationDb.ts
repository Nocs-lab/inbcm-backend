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
    const declaracoes = await Declaracoes.find({}, { _id: 1, anoDeclaracao: 1 })

    console.log(`Iniciando migração para ${declaracoes.length} declarações...`)

    // Logar as declarações encontradas para depuração
    console.log("Declarações encontradas:", declaracoes)

    for (const doc of declaracoes) {
      const { _id, anoDeclaracao } = doc
      console.log(
        `Processando declaração ${_id} com anoDeclaracao: ${anoDeclaracao}`
      )

      // Verificar se o anoDeclaracao é uma string e se existe no mapa
      if (
        typeof anoDeclaracao === "string" &&
        anoToObjectIdMap.has(anoDeclaracao)
      ) {
        const objectId = anoToObjectIdMap.get(anoDeclaracao)
        console.log(`Atualizando anoDeclaracao para ObjectId: ${objectId}`)

        const result = await Declaracoes.updateOne(
          { _id },
          { $set: { anoDeclaracao: objectId } }
        )

        // Logar o resultado da atualização
        console.log(
          `✅ Declaração ${_id} atualizada: ${anoDeclaracao} ➝ ${objectId}, resultado: ${result}`
        )
      } else if (anoDeclaracao === undefined) {
        console.warn(`⚠️ Declaração ${_id} tem anoDeclaracao undefined!`)
      } else {
        console.warn(
          `⚠️ Sem ObjectId para o ano: ${anoDeclaracao} (Declaração ${_id})`
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
