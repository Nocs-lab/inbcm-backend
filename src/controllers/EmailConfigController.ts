import { Request, Response } from "express"
import logger from "../utils/logger"
import { Config } from "../models"

class EmailConfigController {
  public async getEmailConfigs(req: Request, res: Response): Promise<Response> {
    try {
      const config = await Config.findOne({})

      if (!config) {
        return res.status(404).json({ message: "Configuração não encontrada" })
      }

      return res.status(200).json(config)
    } catch (error) {
      logger.error("Erro ao listar as configurações de e-mail:", error)
      return res
        .status(500)
        .json({ message: "Erro ao listar configurações de e-mail" })
    }
  }

  public async updateEmailConfigs(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      await Config.updateOne(
        {},
        {
          emailHost: req.body.emailHost,
          emailPort: req.body.emailPort,
          emailUser: req.body.emailUser,
          emailPass: req.body.emailPass,
          emailFrom: req.body.emailFrom
        },
        { upsert: true }
      )

      return res
        .status(200)
        .json({ message: "Configurações de e-mail atualizadas com sucesso!" })
    } catch (error) {
      logger.error("Erro ao atualizar as configurações de e-mail:", error)
      return res
        .status(500)
        .json({ message: "Erro ao atualizar configurações de e-mail" })
    }
  }
}

export default new EmailConfigController()
