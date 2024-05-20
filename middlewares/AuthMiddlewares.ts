import type { Handler } from "express"
import jwt from "jsonwebtoken"

export const userMiddleware: Handler = (req, res, next) => {
  const { token } = req.signedCookies

  if (!token) {
    return res.status(401).send()
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET!)

  req.body.user = payload

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
