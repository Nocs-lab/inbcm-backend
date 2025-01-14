import argon from "@node-rs/argon2"
import jwt from "jsonwebtoken"
import { RefreshToken, Usuario } from "../models/Usuario"
import config from "../config"
import { IProfile, Profile } from "../models/Profile"
import HTTPError from "../utils/error"

export default class AuthService {
  async login({
    email,
    password,
    admin
  }: {
    email: string
    password: string
    admin: boolean
  }) {
    const user = await Usuario.findOne({ email: email }).populate("profile")

    if (!user) {
      throw new HTTPError("Usuário não encontrado", 404)
    } else if (!(await argon.verify(user.senha, password))) {
      throw new HTTPError("Senha incorreta", 401)
    }
    if (!user.ativo) {
      throw new HTTPError("Usuário não está ativo.", 403)
    }
    const profileName = (user.profile as IProfile)?.name || "sem perfil"

    // Verifica o admin false que vem do endpoint para o front do declarant
    if (admin == false && profileName !== "declarant") {
      throw new HTTPError("O perfil não tem acesso à página", 403)
    }

    // Verifica o admin false que vem do endpoint para o front do admin/analista
    if (admin && !(profileName === "admin" || profileName === "analyst")) {
      throw new HTTPError("O perfil não tem acesso à página", 403)
    }

    // Adiciona o perfil do usuário no payload do JWT
    const token = jwt.sign(
      { sub: user.id, profile: profileName },
      config.JWT_SECRET!,
      { expiresIn: "1h" }
    )
    const { id: refreshToken } = await RefreshToken.create({
      user,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    })

    return {
      token,
      refreshToken,
      user
    }
  }

  async refreshToken({ refreshToken }: { refreshToken: string }) {
    const refreshTokenObj = await RefreshToken.findById(refreshToken)

    if (!refreshTokenObj) {
      throw new HTTPError("RefreshToken inválido", 403)
    } else if (refreshTokenObj.expiresAt.getTime() < Date.now()) {
      throw new HTTPError("RefreshToken expirado", 403)
    }

    const user = (await Usuario.findById(refreshTokenObj.user))!

    const newToken = jwt.sign(
      { sub: user.id, admin: user.admin ? true : undefined },
      config.JWT_SECRET,
      { expiresIn: "1h" }
    )

    return {
      token: newToken
    }
  }
}
