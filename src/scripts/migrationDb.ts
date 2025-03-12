import mongoose from "mongoose"
import { AnoDeclaracao, Declaracoes } from "../models"
import connect from "../db/conn" // Importe a função connect

async function createAnoToObjectIdMap() {
  const anoToObjectIdMap = new Map()

  try {
    // Busque todos os documentos da coleção anoDeclaracao
    const anosDeclaracao = await AnoDeclaracao.find({})

    // Crie um mapa de ano para ObjectId
    for (const doc of anosDeclaracao) {
      anoToObjectIdMap.set(doc.ano.toString(), doc._id)
    }

    console.log("Mapa criado com sucesso:", anoToObjectIdMap)
  } catch (error) {
    console.error("Erro ao criar o mapa:", error)
  }

  return anoToObjectIdMap
}

async function migrateAnoDeclaracao(anoToObjectIdMap) {
  try {
    // Busque apenas as declarações que ainda têm anoDeclaracao como string
    const declaracoes = await Declaracoes.find({
      anoDeclaracao: { $type: "string" }
    })
    console.log(`Total de declarações a serem migradas: ${declaracoes.length}`)

    for (const doc of declaracoes) {
      console.log(
        `Processando declaração ${doc._id}: anoDeclaracao = ${doc.anoDeclaracao}`
      )

      if (typeof doc.anoDeclaracao === "string") {
        const objectId = anoToObjectIdMap.get(doc.anoDeclaracao)

        if (objectId) {
          console.log(
            `Atualizando declaração ${doc._id}: anoDeclaracao = ${objectId}`
          )

          // Atualize o campo anoDeclaracao
          await Declaracoes.updateOne(
            { _id: doc._id },
            { $set: { anoDeclaracao: objectId } }
          )

          console.log(`Declaração ${doc._id} atualizada com sucesso!`)
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
  }
}

async function main() {
  try {
    // Conecte-se ao banco de dados
    await connect()

    // Crie o mapa de ano para ObjectId
    const anoToObjectIdMap = await createAnoToObjectIdMap()

    // Execute a migração
    await migrateAnoDeclaracao(anoToObjectIdMap)
  } catch (error) {
    console.error("Erro no processo principal:", error)
  } finally {
    // Desconecte do banco de dados
    await mongoose.disconnect()
    console.log("Conexão com o banco de dados encerrada.")
  }
}

// Execute o processo principal
main()
