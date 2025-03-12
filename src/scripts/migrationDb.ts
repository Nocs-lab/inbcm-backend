import mongoose from "mongoose"
import { AnoDeclaracao, Declaracoes } from "../models"

export async function createAnoToObjectIdMap() {
  const anoToObjectIdMap = new Map()

  try {
    await mongoose.connect(
      "mongodb://ifrn.2024:ifrn.2024@mongo:27017/inbcm?authSource=admin"
    )

    // Busque todos os documentos da coleção anoDeclaracao
    const anosDeclaracao = await AnoDeclaracao.find({})

    // Crie um mapa de ano para ObjectId
    for (const doc of anosDeclaracao) {
      anoToObjectIdMap.set(doc.ano.toString(), doc._id)
    }

    console.log("Mapa criado com sucesso:", anoToObjectIdMap)
  } catch (error) {
    console.error("Erro ao criar o mapa:", error)
  } finally {
    await mongoose.disconnect()
  }

  return anoToObjectIdMap
}

createAnoToObjectIdMap().then((map) => {
  console.log(map)
})

async function migrateAnoDeclaracao(anoToObjectIdMap) {
  try {
    await mongoose.connect(
      "mongodb://ifrn.2025:ifrn.2025@mongo:27017/inbcm?authSource=admin"
    )

    const declaracoes = await Declaracoes.find({})

    for (const doc of declaracoes) {
      if (typeof doc.anoDeclaracao === "string") {
        const objectId = anoToObjectIdMap.get(doc.anoDeclaracao)

        if (objectId) {
          doc.anoDeclaracao = objectId
          await doc.save() // Salve a alteração
        } else {
          console.warn(
            `Nenhum ObjectId encontrado para o ano: ${doc.anoDeclaracao}`
          )
        }
      }
    }

    console.log("Migração concluída com sucesso!")
  } catch (error) {
    console.error("Erro durante a migração:", error)
  } finally {
    await mongoose.disconnect()
  }
}

createAnoToObjectIdMap().then((map) => {
  migrateAnoDeclaracao(map)
})
