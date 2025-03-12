import mongoose from "mongoose"

import { AnoDeclaracao, Declaracoes } from "../models"
import config from "../config"
const mongoURI = `mongodb://${config.DB_USER}:${config.DB_PASS}@mongo:27017/inbcm?authSource=admin`

async function connect() {
  try {
    await mongoose.connect(mongoURI)
    console.log("Conectado ao MongoDB com sucesso!")
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error)
    process.exit(1)
  }
}

async function createAnoToObjectIdMap() {
  const anoToObjectIdMap = new Map()
  try {
    const anosDeclaracao = await AnoDeclaracao.find({})
    for (const doc of anosDeclaracao) {
      anoToObjectIdMap.set(doc.ano.toString(), doc._id)
    }
    console.log(
      "📌 Mapa de anoDeclaracao criado com sucesso:",
      anoToObjectIdMap
    )
  } catch (error) {
    console.error("Erro ao criar o mapa:", error)
  }
  return anoToObjectIdMap
}

async function migrateAnoDeclaracao(anoToObjectIdMap) {
  try {
    const declaracoes = await Declaracoes.find({}, { _id: 1, anoDeclaracao: 1 })
    console.log(
      `📊 Total de declarações a serem migradas: ${declaracoes.length}`
    )

    for (const doc of declaracoes) {
      const docObject = doc.toObject() // Garante um objeto puro
      const ano = docObject.anoDeclaracao
      console.log(`🔄 Processando declaração ${doc._id}: anoDeclaracao =`, ano)

      if (typeof ano === "string" && anoToObjectIdMap.has(ano)) {
        const objectId = anoToObjectIdMap.get(ano)
        console.log(
          `✅ Atualizando declaração ${doc._id}: anoDeclaracao = ${objectId}`
        )

        await Declaracoes.updateOne(
          { _id: doc._id },
          { $set: { anoDeclaracao: objectId } }
        )

        console.log(`🎉 Declaração ${doc._id} atualizada com sucesso!`)
      } else if (ano === undefined) {
        console.warn(
          `ERRO: O campo anoDeclaracao da declaração ${doc._id} está como undefined!`
        )
      } else {
        console.warn(
          `Nenhum ObjectId encontrado para o ano: ${ano} na declaração ${doc._id}`
        )
      }
    }

    console.log("🚀 Migração concluída com sucesso!")
  } catch (error) {
    console.error("Erro durante a migração:", error)
  }
}

async function main() {
  try {
    await connect()
    const anoToObjectIdMap = await createAnoToObjectIdMap()
    await migrateAnoDeclaracao(anoToObjectIdMap)
  } catch (error) {
    console.error("Erro no processo principal:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Conexão com o banco de dados encerrada.")
  }
}

main()
