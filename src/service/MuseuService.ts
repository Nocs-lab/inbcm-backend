import axios from "axios";
import { Museu } from "../models/Museu";
import logger from "../utils/logger";
import mongoose from "mongoose";
import connect from "../db/conn";

type Metadata = {
  "codigo-identificador-ibram-2"?: { value_as_string?: string };
  esfera?: { value_as_string?: string };
  logradouro?: { value_as_string?: string };
  "numero-2"?: { value_as_string?: string };
  "complemento-2"?: { value_as_string?: string };
  "bairro-3"?: { value_as_string?: string };
  "cep-4"?: { value_as_string?: string };
  municipio?: { value_as_string?: string };
  uf?: { value?: { name?: string } };
};

type MuseuItem = {
  id: number;
  author_id: number;
  author_name: string;
  title: string;
  status: string;
  metadata: Metadata;
};

class MuseuService {
  private readonly API_URL = "https://museusbr.tainacan.org/wp-json/tainacan/v2/collection/208/items";
  private readonly PER_PAGE = 96;

  public async fetchAndSaveMuseusPaginated(): Promise<{ total: number; inserted: number; duplicates: number }> {
    try {
     
      logger.info("Iniciando fetchAndSaveMuseusPaginated...");

      let offset = 0;
      let totalPages = 1;
      let currentPage = 0;
      let totalMuseus = 0;
      let insertedCount = 0;
      let duplicateCount = 0;

      while (currentPage < totalPages) {
        const response = await this.fetchMuseusPage(offset);
        const museusData = response.data.items;

        if (currentPage === 0) {
          const total = parseInt(response.headers["x-wp-total"] || "0", 10);
          totalPages = Math.ceil(total / this.PER_PAGE);
          totalMuseus = total;
         // logger.info(`Total esperado: ${total} museus em ${totalPages} páginas`);
        }

        if (museusData.length > 0) {
          const results = await this.processMuseusPage(museusData);
          insertedCount += results.inserted;
          duplicateCount += results.duplicates;

          offset += museusData.length;
          currentPage++;
        } else {
          break;
        }
      }
      logger.info("fetchAndSaveMuseusPaginated finalizado com sucesso");
      return {
        total: totalMuseus,
        inserted: insertedCount,
        duplicates: duplicateCount
      };
    } catch (error) {
      logger.error(`Erro ao buscar ou inserir museus: ${error}`);
      throw error;
    } 
  }

  private async fetchMuseusPage(offset: number) {
    return await axios.get(this.API_URL, {
      params: {
        offset,
        perpage: this.PER_PAGE,
        fetch_only: "id,author_id,author_name,title,status",
        fetch_only_meta: "15568,2797,2261,1379,259,15171,1367,1375,15563"
      }
    });
  }


  private isTestMuseum(name: string): boolean {
    if (!name) return false;
    
   
    const testMuseumRegex = /\bteste\b/i;

    
    return testMuseumRegex.test(name.trim());
  }
  
  private async processMuseusPage(items: MuseuItem[]): Promise<{ 
    inserted: number; 
    duplicates: number;
    skippedTests: number;
    processedItems: any[];
  }> {
    let inserted = 0;
    let duplicates = 0;
    let skippedTests = 0;
    const processedItems = [];
  
    for (const item of items) {
      if (item.status !== "publish") {
        //logger.info(`Museu ${item.title} não está publicado (status: ${item.status}). Ignorando.`);
        continue;
      }
  
      // Verifica se é um museu de teste
      if (this.isTestMuseum(item.title)) {
        //logger.info(`Museu "${item.title}" identificado como teste. Ignorando.`);
        skippedTests++;
        continue;
      }
  
      const museu = this.mapItemToMuseu(item);
      processedItems.push(museu);
  
      try {
        const isDuplicate = await this.checkDuplicateMuseu(museu);
        if (!isDuplicate) {
          await Museu.create(museu);
          inserted++;
          //logger.info(`Museu ${museu.nome} inserido com sucesso`);
        } else {
          duplicates++;
        }
      } catch (error) {
        //logger.error(`Erro ao processar museu ${museu.nome}:`, error);
      }
    }
  
    return { inserted, duplicates, skippedTests, processedItems };
  }

  private mapItemToMuseu(item: MuseuItem) {
    const metadata = item.metadata || {};

    return {
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
    };
  }

  private async checkDuplicateMuseu(museu: any): Promise<boolean> {
    const existingMuseu = await Museu.findOne({
      nome: museu.nome,
      "endereco.logradouro": museu.endereco.logradouro,
      "endereco.numero": museu.endereco.numero,
      "endereco.bairro": museu.endereco.bairro,
      "endereco.municipio": museu.endereco.municipio,
      "endereco.uf": museu.endereco.uf
    });

    return !!existingMuseu;
  }
}

export default new MuseuService();