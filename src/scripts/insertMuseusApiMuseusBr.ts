import axios from "axios"
import mongoose from "mongoose"
import connect from "../db/conn"
import { Museu } from "../models/Museu"
import logger from "../utils/logger"
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



async function fetchMuseus() {
  try {
    await connect()

    let offset = 0
    const perPage = 96
    let totalPages = 1
    let currentPage = 0

    let count = 0
    while (currentPage < totalPages) {
      const response = await axios.get("https://museusbr.tainacan.org/wp-json/tainacan/v2/collection/208/items", {
        params: {
          offset,
          perpage: perPage,
          fetch_only: "id,author_id,author_name,title,status",
          fetch_only_meta: "15568,2797,2261,1379,259,15171,1367,1375,15563"
        }
      })
      

      const museusData = response.data.items
      console.log(`Página ${currentPage + 1}: ${museusData.length} museus`)

      if (currentPage === 0) {
        const total = parseInt(response.headers["x-wp-total"] || "0", 10)
        totalPages = Math.ceil(total / perPage)
        console.log(`Total esperado: ${total} museus em ${totalPages} páginas`)
      }

      if (museusData.length > 0) {
       
        for (const item of museusData) {
          if (item.status !== "publish") {
            logger.info(`Museu ${item.title} não está publicado (status: ${item.status}). Ignorando.`);
            continue; 
          }
          
          const metadata = item.metadata || {}

          const museu = {
            codIbram: metadata["codigo-identificador-ibram-2"]?.value_as_string || "N/A",
            nome: item.title || "Sem Nome",
            esferaAdministraiva: metadata["esfera"]?.value_as_string || "Desconhecida",
            endereco: {
              logradouro: metadata["logradouro"]?.value_as_string || "Não Informado",
              numero: metadata["numero-2"]?.value_as_string || "S/N",
              complemento: metadata["complemento-2"]?.value_as_string || "",
              bairro: metadata["bairro-3"]?.value_as_string || "Desconhecido",
              cep: metadata["cep-4"]?.value_as_string || "00000-000",
              municipio: metadata["municipio"]?.value_as_string || "Não Informado",
              uf: metadata["uf"]?.value?.name || "Não Informado"
            },
            usuario: []
          }

         
          const verificaDuplicidadeMuseu = await Museu.findOne({
            nome: museu.nome,
            "endereco.logradouro": museu.endereco.logradouro,
            "endereco.numero": museu.endereco.numero,
            "endereco.bairro": museu.endereco.bairro,
            "endereco.municipio": museu.endereco.municipio,
            "endereco.uf": museu.endereco.uf
          })

          if (!verificaDuplicidadeMuseu) {
            try {
              await Museu.create(museu)
              logger.info(`Museu salvo: ${museu.nome} (status: ${item.status})`) 
              logger.info(`Museu ${museu.nome} inserido com sucesso`)
            } catch (insertError) {
              logger.error(`Erro ao inserir museu ${museu.nome}:`, insertError)
            }
          } else {
            count++
          }
        }
        
        
        offset += museusData.length
        currentPage++
      } else {
        break
      }
    }
  } catch (error) {
    throw new Error(`Erro ao buscar ou inserir museus: ${error}`)
  } finally {
    await mongoose.connection.close()
  }
}

fetchMuseus()
