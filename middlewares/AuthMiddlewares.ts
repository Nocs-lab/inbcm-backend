import type { Handler } from "express"
import jwt from "jsonwebtoken"
import { Usuario } from "../models/Usuario"
import { verify } from "@node-rs/argon2"
import config from "../config"
import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000,
	limit: 50,
  keyGenerator: (req) => req.signedCookies.refreshToken
})

export const userMiddleware: Handler = async (req, res, next) => {
  limiter(req, res, async () => {
    if (config.NODE_ENV !== "PRODUCTION") {
      const [email, password] = Buffer.from(req.headers["authorization"]?.split(" ")[1] ?? " : ", "base64").toString().split(":")

      const user = await Usuario.findOne({ email, admin: false })

      if (user) {
        if (await verify(user.senha, password)) {
          req.body.user = {
            ...user,
            sub: user.id,
            admin: user.admin
          }
          return next()
        } else {
          throw new Error("Senha incorreta")
        }
      }
    }

    const { token } = req.signedCookies

    if (!token) {
      return res.status(401).send()
    }

    const payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload

    if (payload.admin) {
      return res.status(404).send()
    }

    req.user = payload

    next()
  })
}

export const adminMiddleware: Handler = async (req, res, next) => {
  limiter(req, res, async () => {
    if (config.NODE_ENV !== "PRODUCTION") {
      const [email, password] = Buffer.from(req.headers["authorization"]?.split(" ")[1] ?? " : ", "base64").toString().split(":")

      const user = await Usuario.findOne({ email, admin: true })

      if (user) {
        if (await verify(user.senha, password)) {
          req.body.user = {
            ...user,
            sub: user.id,
            admin: user.admin
          }
          return next()
        } else {
          throw new Error("Senha incorreta")
        }
      }
    }

    const { token } = req.signedCookies

    if (!token) {
      return res.status(401).send()
    }

    const payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload

    if (!payload.admin) {
      return res.status(404).send()
    }

    req.user = payload

    next()
  })
}
