import mongoose from "mongoose"
import { AnoDeclaracao, Declaracoes } from "../models"
import connect from "../db/conn" // Importe a função connect

async function createAnoToObjectIdMap() {
  const anoToObjectIdMap = new Map()

  try {
    // Busque todos os documentos da coleção AnoDeclaracao
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
    // Busque todas as declarações
    const declaracoes = await Declaracoes.find({})
    console.log(`Total de declarações encontradas: ${declaracoes.length}`)

    for (const doc of declaracoes) {
      if (typeof doc.anoDeclaracao === "string") {
        const objectId = anoToObjectIdMap.get(doc.anoDeclaracao)

        if (objectId) {
          // Atualize o campo anoDeclaracao
          doc.anoDeclaracao = objectId

          // Marque o campo como modificado
          doc.markModified("anoDeclaracao")

          console.log(
            `Atualizando declaração ${doc._id}: anoDeclaracao = ${objectId}`
          )

          // Salve a alteração
          await doc.save()
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
