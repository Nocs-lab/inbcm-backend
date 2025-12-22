import { Request, Response } from "express"
import ExportadorService from "../service/ExportaodorService"

export default class ExportadorController {
  private exportadorService = new ExportadorService()

  constructor() {
    this.criarColecoes = this.criarColecoes.bind(this)
    this.iniciarExportacao = this.iniciarExportacao.bind(this)
    this.listarExportacoes = this.listarExportacoes.bind(this)
    this.obterExportacao = this.obterExportacao.bind(this)
    this.criarExportacao = this.criarExportacao.bind(this)
    this.baixarArquivos = this.baixarArquivos.bind(this)
  }

  async criarColecoes(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const { id } = request.params
      await this.exportadorService.criarColecoes(id)
      return response.status(200).json({ message: "Coleções criadas com sucesso!" })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao criar coleções.'
      return response.status(500).json({ error: errorMessage })
    }
  }

  async iniciarExportacao(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const { id } = request.params
      await this.exportadorService.exportar(id!)
      return response.status(200).json({})
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao iniciar a exportação.'
      return response.status(500).json({ error: errorMessage })
    }
  }

  async listarExportacoes(
    _request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const exportacoes = await this.exportadorService.listarExportacoes()
      return response.status(200).json(exportacoes)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao listar exportações.'
      return response.status(500).json({ error: errorMessage })
    }
  }

  async obterExportacao(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const { id } = request.params
      const exportacao = await this.exportadorService.obterExportacao(id)
      if (!exportacao) {
        return response.status(404).json({ error: "Exportação não encontrada." })
      }
      return response.status(200).json(exportacao)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao obter exportação.'
      return response.status(500).json({ error: errorMessage })
    }
  }

  async criarExportacao(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const exportacao = await this.exportadorService.criarExportacao(request.user.id, request.body.anoId)
      return response.status(201).json(exportacao)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao criar exportação.'
      return response.status(500).json({ error: errorMessage })
    }
  }

  async baixarArquivos(
    request: Request,
    response: Response
  ): Promise<Response | void> {
    try {
      const { id } = request.params
      
      if (!id) {
        return response.status(400).json({ error: 'Export ID is required.' })
      }
      
      const stream = await this.exportadorService.baixarArquivos(id)
      
      response.setHeader('Content-Type', 'application/zip')
      response.setHeader('Content-Disposition', `attachment; filename=exportacao-${id}.zip`)

      stream.on('error', (err: unknown) => {
        const error = err instanceof Error ? err : new Error('Error in download stream.')
        if (!response.headersSent) {
          response
            .status(500)
            .json({ error: error.message })
        } else {
          response.destroy(err as Error)
        }
      })

      response.on('error', (err: unknown) => {
        if ('destroy' in stream && typeof stream.destroy === 'function') {
          stream.destroy(err as Error)
        }
      })
      
      stream.pipe(response)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error while downloading files.'
      return response.status(500).json({ error: errorMessage })
    }
  }
}
