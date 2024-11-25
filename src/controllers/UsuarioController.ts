import { Request, Response } from "express"
import argon2 from "@node-rs/argon2"
import Usuario from "../models/Usuario"
import { Profile } from "../models/Profile"
import mongoose from "mongoose"
import logger from "../utils/logger"

class UsuarioController {
  async registerUsuario(req: Request, res: Response) {
    const { nome, email, senha } = req.body
    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ mensagem: "Nome, email e senha são obrigatórios." })
    }
    const declarante = await Profile.findOne({ name: "declarant" })
    if (!declarante) {
      return res
        .status(400)
        .json({ mensagem: "Perfil declarante não encontrado." })
    }

    try {
      const usuarioExistente = await Usuario.findOne({ email })
      if (usuarioExistente) {
        return res.status(400).json({ mensagem: "Email já está em uso." })
      }
      const senhaHash = await argon2.hash(senha)

      const novoUsuario = new Usuario({
        nome,
        email,
        senha: senhaHash,
        profile: declarante._id as unknown as mongoose.Types.ObjectId
      })

      await novoUsuario.save()

      return res.status(201).json({ mensagem: "Usuário criado com sucesso." })
    } catch (error) {
      logger.error("Erro ao criar usuário:", error)
      return res.status(500).json({ mensagem: "Erro ao criar usuário." })
    }
  }

  async getUsuarios(req: Request, res: Response) {
    try {
      const declarantProfile = await Profile.findOne({ name: "declarant" })

      if (!declarantProfile) {
        return res.status(404).json({ message: "Declarant profile not found" })
      }

      const usuarios = await Usuario.find({
        ativo: true,
        profile: declarantProfile._id
      })
        .populate("profile")
        .populate("museus")

      return res.status(200).json(usuarios)
    } catch (error) {
      logger.error("Erro ao listar usuários:", error)
      return res.status(500).json({ mensagem: "Erro ao listar usuários." })
    }
  }

  async getUsuarioPorId(req: Request, res: Response) {
    const { id } = req.params

    try {
      const usuario = await Usuario.findById(id)
        .populate("museus", "nome")
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
