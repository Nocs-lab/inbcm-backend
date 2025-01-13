import { Request, Response, NextFunction } from "express"
import { AnoDeclaracao } from "../models/AnoDeclaracao"

const uploadPeriodoMiddleware = async (
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
      agora < periodo.dataInicioSubmissao ||
      agora > periodo.dataFimSubmissao
    ) {
      console.log(
        "Período de submissão fechado para o ano de declaração:",
        anoDeclaracao
      )
      return res.status(403).json({
        message: "O período de submissão para este ano está fechado."
      })
    }

    next()
  } catch (erro) {
    console.error("Erro ao verificar o período de submissão:", erro)

    return res.status(500).json({
      message:
        "Erro interno ao verificar o período de submissão. Por favor, tente novamente mais tarde.",
      error:
        erro instanceof Error
          ? erro.message
          : "Erro na verificação do período de upload."
    })
  }
}

export default uploadPeriodoMiddleware
