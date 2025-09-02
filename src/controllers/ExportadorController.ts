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
      console.log(request.body)
      const exportacao = await this.exportadorService.criarExportacao(request.user.id, request.body.anoId)
      return response.status(201).json(exportacao)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao criar exportação.'
      return response.status(500).json({ error: errorMessage })
    }
  }
}
