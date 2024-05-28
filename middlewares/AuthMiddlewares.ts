import type { Handler } from "express"
import jwt from "jsonwebtoken"
import { Usuario } from "../models/Usuario"
import { verify } from "@node-rs/argon2"

export const userMiddleware: Handler = async (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    //console.log("Verificando credenciais de autenticação básica...");
    const [email, password] = Buffer.from(req.headers["authorization"]?.split(" ")[1] ?? " : ", "base64").toString().split(":")

    const user = await Usuario.findOne({ email })
    //console.log("Usuário encontrado:", user);

    if (user && await verify(user.senha, password)) {
      //console.log("Usuário autenticado com sucesso:", user);
      req.body.user = {
        ...user,
        sub: user.id
      }
      //console.log(req.body.user.sub);
      //console.log("Usuário definido na requisição:", req.body.user);
      return next()
    }

  }
  //console.log("Verificando token JWT...");
  const { token } = req.signedCookies

  if (!token) {
    //console.log("Token JWT não encontrado na requisição.");
    return res.status(401).send()
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET!)

  req.body.user = payload

  next()
}

export const adminMiddleware: Handler = async (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    //console.log("Verificando credenciais de autenticação básica...");
    const [email, password] = Buffer.from(req.headers["authorization"]?.split(" ")[1] ?? " : ", "base64").toString().split(":")

    const user = await Usuario.findOne({ email })
    //console.log("Usuário encontrado:", user);

    if (user && await verify(user.senha, password)) {
      //console.log("Usuário autenticado com sucesso:", user);
      req.body.user = {
        ...user,
        sub: user.id,
        admin: user.admin
      }
      // console.log(req.body.user.sub);
      // console.log("Usuário definido na requisição:", req.body.user);
      return next()
    }
  }

  const { token } = req.signedCookies

  if (!token) {
    return res.status(401).send()
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload

  if (!payload.admin) {
    return res.status(404).send()
  }

  req.body.user = payload

  next();
}
