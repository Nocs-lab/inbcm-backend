import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import logger from "../utils/logger";
import dotenv from "dotenv";

class EmailConfigController {

  public async getEmailConfigs(req: Request, res: Response): Promise<Response> {
    try {
      // Forçar recarregar o .env a cada requisição
      const envConfig = dotenv.parse(fs.readFileSync('.env'));

      const emailConfigs = {
        emailHost: envConfig.EMAIL_HOST?.replace(/"/g, ""),
        emailPort: envConfig.EMAIL_PORT?.replace(/"/g, ""),
        emailUser: envConfig.EMAIL_USER?.replace(/"/g, ""),
        emailPass: envConfig.EMAIL_PASS?.replace(/"/g, ""),
        emailFrom: envConfig.EMAIL_FROM?.replace(/"/g, "")
      };

      return res.status(200).json(emailConfigs);
    } catch (error) {
      logger.error("Erro ao listar as configurações de e-mail:", error);
      return res.status(500).json({ message: "Erro ao listar configurações de e-mail" });
    }
  }

  public async updateEmailConfigs(req: Request, res: Response): Promise<Response> {
    try {
      const updates: Record<string, string | number> = {
        EMAIL_HOST: req.body.emailHost,
        EMAIL_PORT: req.body.emailPort,
        EMAIL_USER: req.body.emailUser,
        EMAIL_PASS: req.body.emailPass,
        EMAIL_FROM: req.body.emailFrom
      };

      const envPath = path.resolve(__dirname, "../../.env");
      let envData = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

      Object.entries(updates).forEach(([envKey, value]) => {
        // Coloca o valor entre aspas e aplica regex se necessário
        const formattedValue = `"${String(value)}"`;
        const regex = new RegExp(`^${envKey}=.*`, "m");
        if (regex.test(envData)) {
          envData = envData.replace(regex, `${envKey}=${formattedValue}`);
        } else {
          envData += `\n${envKey}=${formattedValue}`;
        }

        process.env[envKey] = formattedValue;
      });

      fs.writeFileSync(envPath, envData, "utf8");

      return res.status(200).json({ message: "Configurações de e-mail atualizadas com sucesso!" });
    } catch (error) {
      logger.error("Erro ao atualizar as configurações de e-mail:", error);
      return res.status(500).json({ message: "Erro ao atualizar configurações de e-mail" });
    }
  }
}

export default new EmailConfigController();
