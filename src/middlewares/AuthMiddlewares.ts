import type { Handler } from "express"
import jwt from "jsonwebtoken"
import { Usuario } from "../models/Usuario"
import { Profile } from "../models/Profile"
import { Permission } from "../models/Permission"
import { verify } from "@node-rs/argon2"
import config from "../config"
import { IUsuario } from "../models/Usuario"
import HTTPError from "../utils/error"
import logger from "../utils/logger"

// Middleware de verificação de permissões do usuário
export const userPermissionMiddleware: (permission: string) => Handler =
  (permission) => async (req, res, next) => {
    try {
      // Lógica para ambiente de desenvolvimento (basic auth)
      if (config.NODE_ENV !== "PRODUCTION") {
        const authHeader = req.headers["authorization"]
        if (authHeader) {
          const [email, password] = Buffer.from(authHeader.split(" ")[1] ?? " : ", "base64")
            .toString()
            .split(":")
          
          const user = await Usuario.findOne({ email })
          if (user) {
            if (await verify(user.senha, password)) {
              req.user = {
                id: user.id,
                admin: user.admin
              } as unknown as IUsuario
            } else {
              throw new HTTPError("Senha incorreta", 401)
            }
          }
        }
      }

      const { token } = req.signedCookies

      if (!token) {
        return res
          .status(401)
          .json({ message: "Token não fornecido. Acesso negado." })
      }

      const payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload

      req.user = {
        id: payload.sub
      } as unknown as IUsuario

      const idUser = req.user.id

      const userp = await Usuario.findOne({
        id_: idUser
      })

      if (payload.profile === "admin") return next()

      if (!userp) return res.status(401).send("Usuário não identificado.")

      const profile = await Profile.findOne({ name: payload.profile })
      if (!profile) return res.status(401).send("Profile não identificado.")

      if (profile.name === "admin") return next()

      const permissions = await Permission.find({
        _id: { $in: profile.permissions }
      })

      const permissionsNames = permissions.map((perm) => perm.name)

      if (!permissionsNames.includes(permission)) {
        return res
          .status(403)
          .json({ mensagem: "Sem permissão para realizar esta ação." })
      }

      next()
    } catch (error) {
      logger.error("Erro no middleware de permissão:", error)
      return res
        .status(500)
        .json({ message: "Erro interno ao verificar permissão." })
    }
  }
