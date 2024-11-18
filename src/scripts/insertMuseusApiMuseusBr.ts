import axios from "axios"
import mongoose from "mongoose"
import connect from "../db/conn"
import { Museu } from "../models/Museu"

type Metadata = {
  "codigo-identificador-ibram-2"?: { value_as_string?: string }
  esfera?: { value_as_string?: string }
  logradouro?: { value_as_string?: string }
  "numero-2"?: { value_as_string?: string }
  "complemento-2"?: { value_as_string?: string }
  "bairro-3"?: { value_as_string?: string }
  "cep-4"?: { value_as_string?: string }
  municipio?: { value_as_string?: string }
  uf?: { value?: { name?: string } }
}

type MuseuItem = {
  title?: string
  metadata?: Metadata
}

const API_URL =
  "https://museusbr.tainacan.org/wp-json/tainacan/v2/collection/208/items?fetch_only=id,author_id,author_name,title&fetch_only_meta=15568,2797,2261,1379,259,15171,1367"

async function fetchMuseus() {
  try {
    await connect()

    let offset = 0
    const perPage = 100
    let hasNextPage = true

    while (hasNextPage) {
      const response = await axios.get(API_URL, {
        params: {
          offset,
          perpage: perPage
        }
      })

      const museusData = response.data.items

      if (museusData.length > 0) {
        try {
          museusData.forEach(async (item: MuseuItem) => {
            const metadata = item.metadata || {}

            const museu = {
              codIbram:
                metadata["codigo-identificador-ibram-2"]?.value_as_string ||
                "N/A",
              nome: item.title || "Sem Nome",
              esferaAdministraiva:
                metadata["esfera"]?.value_as_string || "Desconhecida",
              endereco: {
                logradouro:
                  metadata["logradouro"]?.value_as_string || "Não Informado",
                numero: metadata["numero-2"]?.value_as_string || "S/N",
                complemento: metadata["complemento-2"]?.value_as_string || "",
                bairro: metadata["bairro-3"]?.value_as_string || "Desconhecido",
                cep: metadata["cep-4"]?.value_as_string || "00000-000",
                municipio:
                  metadata["municipio"]?.value_as_string || "Não Informado",
                uf: metadata["uf"]?.value?.name || "Não Informado"
              },
              usuario: null
            }

            try {
              await Museu.create(museu)
            } catch (insertError) {
              throw new Error(`Erro ao inserir museu: ${insertError}`)
            }
          })
        } catch (insertError) {
          throw new Error(
            `Erro ao inserir museus no banco de dados: ${insertError}`
          )
        }

        offset += perPage
      } else {
        hasNextPage = false
      }
    }
  } catch (error) {
    throw new Error(`Erro ao buscar ou inserir museus: ${error}`)
  } finally {
    mongoose.connection.close()
  }
}

fetchMuseus()
