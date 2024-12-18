import { Request, Response, NextFunction } from "express";
import { AnoDeclaracao } from "../models/AnoDeclaracao";

const uploadPeriodoMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { anoDeclaracao } = req.params;
    const periodo = await AnoDeclaracao.findOne({ ano: anoDeclaracao });

    if (!periodo) {
      return res.status(404).json({
        message: "Ano de declaração não encontrado."
      });
    }

    const agora = new Date();

    if (agora < periodo.dataInicioSubmissao || agora > periodo.dataFimSubmissao) {
      return res.status(400).json({
        message: "O período de submissão para este ano está fechado."
      });
    }


    next();
  } catch (erro) {
    console.error("Erro ao verificar o período de submissão:", erro);
    return res.status(500).json({
      message: "Erro ao verificar o período de submissão."
    });
  }
};

export default uploadPeriodoMiddleware;
