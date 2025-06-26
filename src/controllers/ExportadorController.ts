import ExportadorService from "../service/ExportaodorService"

export default class ExportadorController {
  private exportadorService: ExportadorService

  constructor(exportadorService: ExportadorService) {
    this.exportadorService = exportadorService
  }

  async exportarDados(request: Request, response: Response): Promise<Response> {
    try {
      const { tipoExportacao } = request.body
      const resultado = await this.exportadorService.exportar(tipoExportacao)
      return response.status(200).json(resultado)
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }
}
