import { Request, Response } from "express"
import logger from "../utils/logger"
import ConfiguracaoEmailModel from "../models/Configuracao/email"
import ConfiguracaoPortalPublicoModel from "../models/Configuracao/portalPublico"

class ConfigController {
  public async getEmailConfigs(
    _req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const config = await ConfiguracaoEmailModel.findOne({
        key: "email"
      })

      if (!config) {
        return res.status(200).json({
          emailHost: "",
          emailPort: 0,
          emailUser: "",
          emailPass: "",
          emailFrom: ""
        })
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
      await ConfiguracaoEmailModel.updateOne(
        {
          key: "email"
        },
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

  public async getPortalConfigs(
    _req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const config = await ConfiguracaoPortalPublicoModel.findOne({
        key: "portalPublico"
      })

      if (!config) {
        return res.status(200).json({
          url: "",
          node_de_usuario: "",
          senha: ""
        })
      }

      return res.status(200).json(config)
    } catch (error) {
      logger.error("Erro ao listar as configurações do portal:", error)
      return res
        .status(500)
        .json({ message: "Erro ao listar configurações do portal" })
    }
  }

  public async updatePortalConfigs(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      await ConfiguracaoPortalPublicoModel.updateOne(
        {
          key: "portalPublico"
        },
        {
          url: req.body.url,
          node_de_usuario: req.body.node_de_usuario,
          senha: req.body.senha
        },
        { upsert: true }
      )

      return res
        .status(200)
        .json({ message: "Configurações do portal atualizadas com sucesso!" })
    } catch (error) {
      logger.error("Erro ao atualizar as configurações do portal:", error)
      return res
        .status(500)
        .json({ message: "Erro ao atualizar configurações do portal" })
    }
  }
}

export default new ConfigController()
