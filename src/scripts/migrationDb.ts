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
    console.log("Declarações encontradas:", declaracoes)

    for (const doc of declaracoes) {
      const { _id, anoDeclaracao } = doc
      console.log("buscando ano declaracao" + doc.anoDeclaracao)

      // Verificar se o campo anoDeclaracao está preenchido corretamente
      if (!anoDeclaracao) {
        console.warn(
          `⚠️ Declaração ${_id} tem anoDeclaracao undefined ou mal preenchido!`
        )
        continue // Pular para a próxima declaração se anoDeclaracao estiver faltando
      }

      // Verificar se anoDeclaracao é uma string (como '2025') e se o mapa contém esse ano
      if (
        typeof anoDeclaracao === "string" &&
        anoToObjectIdMap.has(anoDeclaracao)
      ) {
        const objectId = anoToObjectIdMap.get(anoDeclaracao) // Obter o ObjectId para o ano '2025'

        // Atualizar o campo anoDeclaracao com o ObjectId
        await Declaracoes.updateOne(
          { _id },
          { $set: { anoDeclaracao: objectId } }
        )

        console.log(
          `✅ Declaração ${_id} atualizada: ${anoDeclaracao} ➝ ${objectId}`
        )
      } else {
        console.warn(
          `⚠️ Não foi possível encontrar o ObjectId para o ano: ${anoDeclaracao}`
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
