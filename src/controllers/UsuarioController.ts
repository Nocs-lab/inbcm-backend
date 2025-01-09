import { Request, Response } from "express"
import argon2 from "@node-rs/argon2"
import Usuario from "../models/Usuario"
import logger from "../utils/logger"
import { UsuarioService } from "../service/UserService"

class UsuarioController {
  async registerUsuario(req: Request, res: Response) {
    const { nome, email, senha, profile, especialidadeAnalista } = req.body

    if (!nome || !email || !senha || !profile) {
      return res
        .status(400)
        .json({ mensagem: "Nome, email, senha e perfil são obrigatórios." })
    }

    try {
      const perfilExistente = await UsuarioService.validarUsuario({
        email,
        profile,
        especialidadeAnalista
      })

      await UsuarioService.criarUsuario({
        nome,
        email,
        senha,
        profile,
        especialidadeAnalista:
          perfilExistente.name === "analyst" ? especialidadeAnalista : null
      })

      return res.status(201).json({ mensagem: "Usuário criado com sucesso." })
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error("Erro ao criar usuário:", error)
        return res.status(400).json({ mensagem: error.message })
      }

      logger.error("Erro inesperado:", error)
      return res
        .status(500)
        .json({ mensagem: "Erro desconhecido ao criar usuário." })
    }
  }
  async getUsuarios(req: Request, res: Response) {
    try {
      const { perfil } = req.query

      const perfilArray: string[] =
        typeof perfil === "string"
          ? [perfil]
          : Array.isArray(perfil)
            ? perfil.map((item) => String(item))
            : []

      const result = await UsuarioService.buscarUsuarios(perfilArray)

      return res.status(200).json(result)
    } catch (error) {
      console.error("Erro ao listar usuários:", error)
      return res.status(500).json({ mensagem: "Erro ao listar usuários." })
    }
  }

  async getUsuarioPorId(req: Request, res: Response) {
    const { id } = req.params

    try {
      const usuario = await Usuario.findById(id)
        .populate("museus")
        .populate("profile")
      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." })
      }
      return res.status(200).json(usuario)
    } catch (error) {
      logger.error("Erro ao buscar usuário:", error)
      return res.status(500).json({ mensagem: "Erro ao buscar usuário." })
    }
  }

  async atualizarUsuario(req: Request, res: Response) {
    const { id } = req.params
    const { nome, email, senha, profile } = req.body
    try {
      const usuario = await Usuario.findById(id)
      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." })
      }
      if (nome) usuario.nome = nome
      if (email && email !== usuario.email) {
        const usuarioExistente = await Usuario.findOne({ email })
        if (usuarioExistente) {
          return res.status(400).json({ mensagem: "Email já está em uso." })
        }
        usuario.email = email
      }
      if (senha) usuario.senha = await argon2.hash(senha)
      if (profile) usuario.profile = profile

      await usuario.save()

      return res
        .status(200)
        .json({ mensagem: "Usuário atualizado com sucesso." })
    } catch (error) {
      logger.error("Erro ao atualizar usuário:", error)
      return res.status(500).json({ mensagem: "Erro ao atualizar usuário." })
    }
  }

  async deletarUsuario(req: Request, res: Response) {
    const { id } = req.params

    try {
      const usuario = await Usuario.findById(id)
      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." })
      }

      usuario.ativo = false
      await usuario.save()

      return res.status(200).json({ mensagem: "Usuário deletado com sucesso." })
    } catch (error) {
      logger.error("Erro ao deletar usuário:", error)
      return res.status(500).json({ mensagem: "Erro ao deletar usuário." })
    }
  }

  async getUsersByProfile(req: Request, res: Response) {
    const { profileId } = req.params

    try {
      const usuarios = await Usuario.find({
        profile: profileId,
        ativo: true
      }).populate("profile")
      if (usuarios.length === 0) {
        return res
          .status(404)
          .json({ mensagem: "Nenhum usuário encontrado para este perfil." })
      }
      return res.status(200).json(usuarios)
    } catch (error) {
      logger.error("Erro ao listar usuários por perfil:", error)
      return res
        .status(500)
        .json({ mensagem: "Erro ao listar usuários por perfil." })
    }
  }
}

export default new UsuarioController()
