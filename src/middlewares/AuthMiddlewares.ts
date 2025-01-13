import type { Handler } from "express"
import jwt from "jsonwebtoken"
import { Usuario } from "../models/Usuario"
import { Profile } from "../models/Profile"
import { Permission } from "../models/Permission"
import { verify } from "@node-rs/argon2"
import config from "../config"
import { rateLimit } from "express-rate-limit"
import { IUsuario } from "../models/Usuario"

// Configuração do rate limiter para limitar requisições
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // Janela de 2 minutos
  limit: 50, // Máximo de 50 requisições por janela
  keyGenerator: (req) => req.signedCookies.refreshToken // Identificador baseado no cookie `refreshToken`
})

// Middleware de verificação de permissões do usuário
export const userPermissionMiddleware: (permission: string) => Handler =
  (permission) => async (req, res, next) => {
    try {
      // Aplica o rate limiter antes de processar a lógica do middleware
      limiter(req, res, async () => {
        // Lógica para ambiente de desenvolvimento
        if (config.NODE_ENV !== "PRODUCTION") {
          const [email, password] = Buffer.from(
            req.headers["authorization"]?.split(" ")[1] ?? " : ",
            "base64"
          )
            .toString()
            .split(":")

          // Busca o usuário no banco com base no email fornecido
          const user = await Usuario.findOne({
            email: email
          })

          if (user) {
            // Verifica a senha do usuário
            if (await verify(user.senha, password)) {
              req.user = {
                id: user.id,
                admin: user.admin
              } as unknown as IUsuario;
            } else {
              throw new Error("Senha incorreta") // Erro caso a senha não corresponda
            }
          }
        }

        // Recupera o token JWT do cookie assinado
        const { token } = req.signedCookies

        // Caso o token não seja fornecido, retorna erro de acesso não autorizado
        if (!token) {
          return res
            .status(401)
            .json({ message: "Token não fornecido. Acesso negado." })
        }

        // Decodifica o token JWT para obter o payload
        const payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload

        // Adiciona informações do usuário ao objeto `req`
        req.user = {
          id: payload.sub
        } as unknown as IUsuario;

        // Recupera credenciais do cabeçalho de autorização
        const [email, password] = Buffer.from(
          req.headers["authorization"]?.split(" ")[1] ?? " : ",
          "base64"
        )

        const idUser = req.user.id

        // Busca o usuário com base no ID presente no token
        const userp = await Usuario.findOne({
          id_: idUser
        })

        // Se o perfil no payload for 'admin', permite o acesso direto
        if (payload.profile == "admin") return next()

        // Verifica se o usuário existe
        if (!userp) return res.status(401).send("Usuário não identificado.")

        // Recupera o ID do perfil associado ao usuário
        const profile_id = userp.profile.toString()

        // Busca o perfil no banco de dados
        const profile = await Profile.findOne({ name: payload.profile })

        if (!profile) return res.status(401).send("Profile não identificado.")

        // Caso o perfil seja 'admin', permite o acesso direto
        if (profile.name === "admin") return next()

        // Busca as permissões associadas ao perfil
        const permissions = await Permission.find({
          _id: { $in: profile.permissions }
        })

        // Extrai os nomes das permissões
        const permissionsNames = permissions.map(
          (permission) => permission.name
        )

        // Verifica se a permissão requerida está presente

        if (!permissionsNames.includes(permission)) {
          return res
            .status(403)
            .json({ mensagem: "Sem permissão para realizar esta ação." })
        }

        // Se todas as verificações passarem, continua para o próximo middleware
        next()
      })
    } catch (error) {
      console.error("Erro no middleware de permissão:", error)
      // Retorna um erro interno caso ocorra algum problema
      return res
        .status(500)
        .json({ message: "Erro interno ao verificar permissão." })
    }
  }
