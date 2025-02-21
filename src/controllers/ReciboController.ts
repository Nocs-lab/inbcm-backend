import { Request, Response } from "express"
import mongoose from "mongoose"
import { gerarPDFRecibo } from "../service/ReciboService"
import logger from "../utils/logger"
import { Declaracoes } from "../models"
import { gerarPDFRelatorioPendenciais } from "../service/RelatorioPendenciaService"

class ReciboController {
  /**
   * Gera o recibo em formato PDF com base no ID da declaração fornecido na requisição.
   *   @param req.params - Parâmetros da rota:
   *     @param idDeclaracao - ID da declaração para a qual o recibo será gerado.

   */
  async gerarRecibo(req: Request, res: Response) {
    try {
      const { idDeclaracao } = req.params
      if (!mongoose.Types.ObjectId.isValid(idDeclaracao)) {
        res.status(400).json({ error: "ID inválido." })
        return
      }

      const declaracaoId = new mongoose.Types.ObjectId(idDeclaracao)
      const pdfBuffer = await gerarPDFRecibo(declaracaoId)

      res.setHeader("Content-Disposition", "attachment; filename=recibo.pdf")
      res.setHeader("Content-Type", "application/pdf")
      res.send(pdfBuffer)
    } catch (error) {
      logger.error("Erro ao gerar o recibo:", error)
      res.status(500).json({ error: "Erro ao gerar o recibo." })
    }
  }
  async gerarReciboDetalhamento(req: Request, res: Response) {
    console.log("testando detalhamento")
    try {
      const { id } = req.params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "ID inválido." })
        return
      }

      const declaracaoId = new mongoose.Types.ObjectId(id)
      const pdfBuffer = await gerarPDFRelatorioPendenciais(declaracaoId)

      res.setHeader("Content-Disposition", "attachment; filename=recibo.pdf")
      res.setHeader("Content-Type", "application/pdf")
      res.send(pdfBuffer)
    } catch (error) {
      logger.error("Erro ao gerar o recibo:", error)
      res.status(500).json({ error: "Erro ao gerar o recibo." })
    }
  }

  async validarRecibo(req: Request, res: Response): Promise<Response> {
    try {
      const { hashDeclaracao } = req.params

      logger.info(`Iniciando validação de recibo para hash: ${hashDeclaracao}`)

      if (!hashDeclaracao) {
        logger.warn("Hash da declaração não fornecido.")
        return res
          .status(400)
          .json({ mensagem: "Hash da declaração é obrigatório." })
      }

      const declaracao = await Declaracoes.findOne({
        hashDeclaracao,
        status: { $ne: "Excluído" }
      })

      if (!declaracao) {
        logger.warn(
          `Declaração não encontrada ou está excluída. Hash: ${hashDeclaracao}`
        )
        return res.status(404).json({ mensagem: "Declaração não encontrada." })
      }

      const totalItens =
        (declaracao.museologico?.quantidadeItens || 0) +
        (declaracao.arquivistico?.quantidadeItens || 0) +
        (declaracao.bibliografico?.quantidadeItens || 0)

      logger.info(
        `Declaração encontrada. Hash: ${hashDeclaracao}, Total de itens: ${totalItens}`
      )

      return res.status(200).json({
        mensagem:
          "Declaração reconhecida e emitida pelo sistema Inventário Nacional de Bens Culturais Musealizados (INBCM).",
        declaracao,
        totalItens
      })
    } catch (erro) {
      return res
        .status(500)
        .json({ mensagem: "Erro interno ao validar recibo." })
    }
  }
}

export default ReciboController
