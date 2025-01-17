import { Request, Response, NextFunction } from "express"
import { AnoDeclaracao } from "../models/AnoDeclaracao"

const RetificacaoPeriodoMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { anoDeclaracao } = req.params

    if (
      !anoDeclaracao ||
      isNaN(Number(anoDeclaracao)) ||
      Number(anoDeclaracao) <= 2000
    ) {
      return res.status(400).json({
        message:
          "Ano de declaração inválido. Por favor, forneça um número válido."
      })
    }

    const periodo = await AnoDeclaracao.findOne({ ano: anoDeclaracao })

    if (!periodo) {
      return res.status(404).json({
        message: "Ano de declaração não encontrado."
      })
    }

    const agora = new Date()

    if (
      agora < periodo.dataInicioRetificacao ||
      agora > periodo.dataFimRetificacao
    ) {
      return res.status(403).json({
        message: "O período de retificação para este ano está fechado."
      })
    }

    next()
  } catch (erro) {
    console.error("Erro ao verificar o período de retificação:", erro)

    return res.status(500).json({
      message:
        "Erro interno ao verificar o período de retificação. Por favor, tente novamente mais tarde.",
      error:
        erro instanceof Error
          ? erro.message
          : "Erro na verificação do período de retificação."
    })
  }
}

export default RetificacaoPeriodoMiddleware
