import { Arquivistico, Bibliografico, Museologico } from "../models"

export default class ExportadorService {
  async createCollections() {
    const [re1, res2, res3] = await Promise.all([
      fetch(
        `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/collections/?context=edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TAINACAN_TOKEN}`
          },
          body: JSON.stringify({
            name: "Museológico",
            description: "",
            status: "auto-draft",
            mapper: false
          })
        }
      ),
      fetch(
        `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/collections/?context=edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TAINACAN_TOKEN}`
          },
          body: JSON.stringify({
            name: "Arquivístico",
            description: "",
            status: "auto-draft",
            mapper: false
          })
        }
      ),
      fetch(
        `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/collections/?context=edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TAINACAN_TOKEN}`
          },
          body: JSON.stringify({
            name: "Bibliográfico",
            description: "",
            status: "auto-draft",
            mapper: false
          })
        }
      )
    ])

    const [
      { id: museologicoId },
      { id: arquivisticoId },
      { id: bibliograficoId }
    ] = await Promise.all([re1.json(), res2.json(), res3.json()])
  }

  async gerarArquivos(): Promise<any> {
    const [itensMuseologicos, itensArquvitiscos, itensBibiograficos] =
      await Promise.all([
        Museologico.find(),
        Arquivistico.find(),
        Bibliografico.find()
      ])

    const museologicoCsv = this.gerarCsv(itensMuseologicos, "museologico")
    const arquivisticoCsv = this.gerarCsv(itensArquvitiscos, "arquivistico")
    const bibliograficoCsv = this.gerarCsv(itensBibiograficos, "bibliografico")
  }

  async expotarArquivo(arquivo: File): Promise<string> {
    const res = await fetch(
      `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/importers/session/`
    )

    const { id: session } = await res.json()
  }
}
