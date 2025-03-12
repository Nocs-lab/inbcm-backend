import { Declaracoes } from "../models"

async function createAnoToObjectIdMap() {
  const anoToObjectIdMap = new Map()

  try {
    // Buscando os documentos da coleção AnoDeclaracoes
    const anosDeclaracao = await AnoDeclaracao.find({}, { ano: 1, _id: 1 })

    for (const doc of anosDeclaracao) {
      // Mapeando o número do ano para o ObjectId
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

    console.log(
      `🔄 Iniciando migração para ${declaracoes.length} declarações...`
    )

    for (const doc of declaracoes) {
      const { _id, anoDeclaracao } = doc

      // Log para inspecionar o valor e tipo de anoDeclaracao
      console.log(
        `🔍 Verificando Declaração ${_id}: anoDeclaracao =`,
        anoDeclaracao,
        `(${typeof anoDeclaracao})`
      )

      if (
        typeof anoDeclaracao === "string" &&
        anoToObjectIdMap.has(anoDeclaracao)
      ) {
        // Se anoDeclaracao for uma string (ano como '2024', '2025', etc.)
        const objectId = anoToObjectIdMap.get(anoDeclaracao)

        // Atualizando a declaração para ter o ObjectId no campo anoDeclaracao
        await Declaracoes.updateOne(
          { _id },
          { $set: { anoDeclaracao: objectId } }
        )

        console.log(
          `✅ Declaração ${_id} atualizada: ${anoDeclaracao} ➝ ${objectId}`
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
