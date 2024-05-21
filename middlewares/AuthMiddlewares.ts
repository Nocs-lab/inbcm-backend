import type { Handler } from "express"
import jwt from "jsonwebtoken"
import { Usuario } from "../models/Usuario"
import { verify } from "@node-rs/argon2"

export const userMiddleware: Handler = async (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    const [email, password] = Buffer.from(req.headers["authorization"]?.split(" ")[1] ?? " : ", "base64").toString().split(":")

    const user = await Usuario.findOne({ email })

    if (!user || await verify(user.senha, password) === false) {
      return res.status(401).send()
    }

    req.body.user = {
      ...user,
      sub: user.id
    }
  } else {
    const { token } = req.signedCookies

    if (!token) {
      return res.status(401).send()
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!)

    req.body.user = payload
  }

  next()
}

export const adminMiddleware: Handler = (req, res, next) => {
  const { token } = req.signedCookies

  if (!token) {
    return res.status(401).send()
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload

  if (!payload.admin) {
    return res.status(404).send()
  }

  req.body.user = payload

  next()
}
