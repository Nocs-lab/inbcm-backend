import axios from "axios";
import { Museu } from "../models/Museu";
import logger from "../utils/logger";
import isEqual from "lodash.isequal";

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
  private readonly API_URL = "https://cadastro.museus.gov.br/wp-json/tainacan/v2/collection/208/items";
  private readonly PER_PAGE = 96;

  public async fetchAndSaveMuseusPaginated(): Promise<{ total: number; inserted: number; updated: number; duplicates: number; skippedTests: number }> {
    try {
      logger.info("Iniciando fetchAndSaveMuseusPaginated...");

      let offset = 0;
      let totalPages = 1;
      let currentPage = 0;
      let totalMuseus = 0;
      let inserted = 0;
      let updated = 0;
      let duplicates = 0;
      let skippedTests = 0;

      while (currentPage < totalPages) {
        const response = await this.fetchMuseusPage(offset);
        const museusData = response.data.items;

        if (currentPage === 0) {
          const total = parseInt(response.headers["x-wp-total"] || "0", 10);
          totalPages = Math.ceil(total / this.PER_PAGE);
          totalMuseus = total;
        }

        if (museusData.length > 0) {
          for (const item of museusData) {
            if (item.status !== "publish") continue;
            if (this.isTestMuseum(item.title)) {
              skippedTests++;
              continue;
            }

            const museu = this.mapItemToMuseu(item);
            const status = await this.upsertMuseu(museu);
            if (status === "inserted") inserted++;
            else if (status === "updated") updated++;
            else if (status === "duplicate") duplicates++;
          }

          offset += museusData.length;
          currentPage++;
        } else {
          break;
        }
      }

      logger.info("fetchAndSaveMuseusPaginated finalizado com sucesso");

      return {
        total: totalMuseus,
        inserted,
        updated,
        duplicates,
        skippedTests
      };
    } catch (error) {
      logger.error(`Erro ao buscar ou inserir museus: ${error}`);
      throw error;
    }
  }

  private async fetchMuseusPage(offset: number) {
    return axios.get(this.API_URL, {
      params: {
        offset,
        perpage: this.PER_PAGE,
        fetch_only: "id,author_id,author_name,title,status",
        fetch_only_meta: "15568,2797,2261,1379,259,15171,1367,1375,15563"
      }
    });
  }

  private isTestMuseum(name: string): boolean {
    return /\bteste\b/i.test(name?.trim() || "");
  }

  private mapItemToMuseu(item: MuseuItem) {
    const metadata = item.metadata || {};

    return {
      idMuseusBr: item.id,
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

  private async  normalizarMuseu(museu: any) {
    return {
      codIbram: (museu.codIbram || "").trim().toLowerCase(),
      nome: (museu.nome || "").trim().toLowerCase(),
      esferaAdministraiva: (museu.esferaAdministraiva || "").trim().toLowerCase(),
      endereco: {
        logradouro: (museu.endereco?.logradouro || "").trim().toLowerCase(),
        numero: (museu.endereco?.numero || "").trim().toLowerCase(),
        complemento: (museu.endereco?.complemento || "").trim().toLowerCase(),
        bairro: (museu.endereco?.bairro || "").trim().toLowerCase(),
        cep: (museu.endereco?.cep || "").replace(/\D/g, ""),
        municipio: (museu.endereco?.municipio || "").trim().toLowerCase(),
        uf: (museu.endereco?.uf || "").trim().toUpperCase(),
      }
    };
  }

 private async upsertMuseu(museu: any): Promise<"inserted" | "updated" | "duplicate"> {
  const existingMuseu = await Museu.findOne({ idMuseusBr: museu.idMuseusBr });

  if (!existingMuseu) {
    await Museu.create(museu);
    return "inserted";
  }

  const dadosAntigos = this.normalizarMuseu(existingMuseu);
  const dadosNovos = this.normalizarMuseu(museu);

  if (!isEqual(dadosAntigos, dadosNovos)) {
    await Museu.updateOne({ idMuseusBr: museu.idMuseusBr }, museu);
    logger.info(`Museu ${museu.nome} atualizado com novas informações.`);
    return "updated";
  }

  return "duplicate";
}

}

export default new MuseuService()
