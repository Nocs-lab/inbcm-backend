import type { Handler } from "express"
import jwt from "jsonwebtoken"

export const userMiddleware: Handler = (req, _res, next) => {
  const { token } = req.cookies

  const payload = jwt.verify(token, process.env.JWT_SECRET!)

  req.body.user = payload

  next()
}

export const adminMiddleware: Handler = (req, res, next) => {
  const { token } = req.cookies

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload

  if (!payload.admin) {
    return res.status(404).send()
  }

  req.body.user = payload

  next()
}
