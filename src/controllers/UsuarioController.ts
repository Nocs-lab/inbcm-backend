import { Request, Response } from "express"
import Usuario, { SituacaoUsuario, validarCPF } from "../models/Usuario"
import logger from "../utils/logger"
import { UsuarioService } from "../service/UserService"
import { Declaracoes, Museu } from "../models"
import { IProfile, Profile } from "../models/Profile"
import { Types } from "mongoose"
import { UpdateUserDto } from "../models/dto/UserDto"
import { Status } from "../enums/Status"
import HTTPError from "../utils/error"
import argon2 from "@node-rs/argon2"
import minioClient from "../db/minioClient"
import { sendEmail } from "../emails"

class UsuarioController {
  async registerUsuarioExternoDeclarant(req: Request, res: Response) {
    const { nome, email, cpf, museus, senha } = req.body

    try {
      await UsuarioService.validarUsuarioExternoDeclarant({
        nome,
        email,
        profile: "declarant",
        cpf,
        senha
      })

      const novoUsuario = await UsuarioService.criarUsuarioExternoDeclarant({
        nome,
        email,
        profile: "declarant",
        cpf,
        museus: Array.isArray(museus) ? museus : [museus],
        arquivo: req.file!,
        senha
      })

      return res.status(201).json({
        message:
          "Pedido de acesso ao sistema INBCM feito com sucesso. Aguarde análise.",
        usuario: novoUsuario
      })
    } catch (error: unknown) {
      logger.error("Erro ao criar usuário declarante externo:", error)
      if (error instanceof HTTPError) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({
        message: "Erro desconhecido ao criar usuário declarante externo."
      })
    }
  }

  async registerUsuarioExternoAnalyst(req: Request, res: Response) {
    const { nome, email, cpf, senha, especialidadeAnalista } = req.body

    try {
      await UsuarioService.validarUsuarioExternoAnalyst({
        nome,
        email,
        profile: "analyst",
        cpf,
        senha,
        especialidadeAnalista
      })

      const novoUsuario = await UsuarioService.criarUsuarioExternoAnalyst({
        nome,
        email,
        profile: "analyst",
        cpf,
        arquivo: req.file!,
        senha,
        especialidadeAnalista
      })

      return res.status(201).json({
        message:
          "Pedido de acesso ao sistema INBCM feito com sucesso. Aguarde análise.",
        usuario: novoUsuario
      })
    } catch (error: unknown) {
      logger.error("Erro ao criar usuário analista externo:", error)
      if (error instanceof HTTPError) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({
        message: "Erro desconhecido ao criar usuário analista externo."
      })
    }
  }

  async registerUsuario(req: Request, res: Response) {
    const { nome, email, senha, cpf, profile, especialidadeAnalista, museus } =
      req.body

    if (!nome || !email || !senha || !profile || !cpf) {
      throw new HTTPError(
        "Nome,email,senha,profile e cpf são dados obrigatórios",
        422
      )
    }

    try {
      const perfilExistente = await UsuarioService.validarUsuario({
        email,
        profile,
        especialidadeAnalista,
        cpf
      })

      let especialidades = especialidadeAnalista

      if (perfilExistente.name === "admin") {
        especialidades = ["museologico", "arquivistico", "bibliografico"]
      }

      const novoUsuario = await UsuarioService.criarUsuario({
        nome,
        email,
        senha,
        profile,
        cpf,
        museus,
        especialidadeAnalista: especialidades
      })

      return res.status(201).json({
        message: "Usuário criado com sucesso.",
        usuario: novoUsuario
      })
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        logger.error("Erro ao criar usuário:", error)
        return res.status(400).json({ message: error.message })
      }

      logger.error("Erro inesperado:", error)
      return res.status(500).json({
        message: "Erro desconhecido ao criar usuário, ", error
      })
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
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        logger.error("Erro ao listar usuários:", error)
        return res.status(400).json({ message: error.message })
      }
      logger.error("Erro inesperado listar usuário:", error)
      return res.status(500).json({
        message: "Erro desconhecido ao listar usuário."
      })
    }
  }

  async getUsuarioPorId(req: Request, res: Response) {
    const { id } = req.params

    try {
      const usuario = await Usuario.findById(id)
        .populate("museus")
        .populate("profile")
      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado." })
      }
      return res.status(200).json(usuario)
    } catch (error) {
      logger.error("Erro ao buscar usuário:", error)
      return res.status(500).json({ message: "Erro ao buscar usuário." })
    }
  }

  async getUsuario(req: Request, res: Response) {
    const userId = req.user?.id

    try {
      const usuario = await Usuario.findById(userId)
        .populate("museus")
        .populate("profile", "name _id")
      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado." })
      }
      return res.status(200).json(usuario)
    } catch (error) {
      logger.error("Erro ao buscar usuário:", error)
      return res.status(500).json({ message: "Erro ao buscar usuário." })
    }
  }

  async atualizarUsuario(req: Request, res: Response) {
    try {
      const { id } = req.params
      const {
        nome,
        email,
        perfil,
        especialidadeAnalista,
        museus,
        desvincularMuseus,
        cpf,
        situacao
      }: UpdateUserDto = req.body

      const usuario = await Usuario.findById(id)
      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado." })
      }

      if (situacao !== undefined && situacao === SituacaoUsuario.Inativo) {
        const declaracoesUsuario = await Declaracoes.find({
          responsavelEnvio: id,
          ultimaDeclaracao: true,
          status: { $ne: "Excluída" }
        })
        if (declaracoesUsuario.length > 0) {
          throw new HTTPError(
            "Não é possível inativar o usuário porque ele está vinculado a declarações.",
            400
          )
        }
      }

      if (situacao !== undefined) {
        if (!Object.values(SituacaoUsuario).includes(situacao)) {
          throw new HTTPError("Situação do usuário inválida.", 400)
        }
        if (situacao === SituacaoUsuario.Inativo) {
          const declaracoesUsuario = await Declaracoes.find({
            responsavelEnvio: id,
            ultimaDeclaracao: true,
            status: { $ne: "Excluída" }
          })
          if (declaracoesUsuario.length > 0) {
            throw new HTTPError(
              "Usuário vinculado a declarações não pode ser inativado.",
              400
            )
          }
        }
        // if (situacao === SituacaoUsuario.Ativo) {
        //   usuario.senha = await argon2.hash("1234")
        // }
        usuario.situacao = situacao
      }

      if (nome) usuario.nome = nome
      if (email) usuario.email = email

      if (perfil) {
        const perfilValido = await Profile.findOne({ name: perfil }).exec()
        if (!perfilValido) {
          return res.status(400).json({ message: "Perfil inválido." })
        }
        usuario.profile = perfilValido._id as Types.ObjectId
      }

      if (cpf && cpf !== usuario.cpf) {
        const cpfFormatado = cpf.replace(/\D/g, "")
        if (!validarCPF(cpfFormatado)) {
          return res.status(400).json({ message: "CPF inválido." })
        }
        usuario.cpf = cpfFormatado
      }

      if (museus && Array.isArray(museus)) {
        for (const museuId of museus) {
          if (!Types.ObjectId.isValid(museuId)) continue

          const museu = await Museu.findById(museuId)
          if (!museu) continue

          const objectId = new Types.ObjectId(id)
          if (!museu.usuario.some((userId) => userId.equals(objectId))) {
            museu.usuario.push(objectId)
            await museu.save()
          }

          if (!usuario.museus.some((mId) => mId.equals(museuId))) {
            usuario.museus.push(museuId)
          }
        }
      }

      if (desvincularMuseus && Array.isArray(desvincularMuseus)) {
        for (const museuId of desvincularMuseus) {
          if (!Types.ObjectId.isValid(museuId)) continue

          const museu = await Museu.findById(museuId)
          if (!museu) continue

          if (!museu.usuario.some((userId) => userId.equals(id))) continue

          const declaracoesVinculadas = await Declaracoes.find({
            museu: museuId,
            status: { $in: [Status.Recebida, Status.EmAnalise] }
          })

          if (declaracoesVinculadas.length > 0) {
            throw new HTTPError(
              "Não é possível desvincular o usuário devido a declarações pendentes.",
              400
            )
          }

          museu.usuario = museu.usuario.filter((userId) => !userId.equals(id))
          await museu.save()

          usuario.museus = usuario.museus.filter((mId) => !mId.equals(museuId))
        }
      }

      if (especialidadeAnalista) {
        const perfilAtual = await Profile.findById(usuario.profile)
        if (perfilAtual?.name !== "analyst") {
          return res
            .status(400)
            .json({ message: "Apenas analistas podem ter especialidades." })
        }

        if (!Array.isArray(especialidadeAnalista)) {
          return res
            .status(400)
            .json({ message: "Especialidades devem ser um array." })
        }

        const especialidadesPermitidas = [
          "museologico",
          "bibliografico",
          "arquivistico"
        ]
        if (
          especialidadeAnalista.some(
            (e) => !especialidadesPermitidas.includes(e)
          )
        ) {
          return res
            .status(400)
            .json({ message: "Especialidades inválidas fornecidas." })
        }

        usuario.especialidadeAnalista = especialidadeAnalista
      }

      await usuario.save()
      if (usuario.situacao == 0 && situacao == 3){
        await sendEmail("reprovacao-cadastro-usuario", usuario.email, {nome:usuario.nome})
      }
      return res
        .status(200)
        .json({ message: "Usuário atualizado com sucesso.", usuario })
    } catch (error) {
      logger.error("Erro ao atualizar usuário:", error)
      if (error instanceof HTTPError) {
        return res.status(error.status).json({ message: error.message })
      }
      return res.status(500).json({ message: "Erro ao atualizar usuário." })
    }
  }

  async deletarUsuario(req: Request, res: Response) {
    const { id } = req.params

    try {
      const usuario = await Usuario.findById(id)
        .populate("profile")
        .populate("museus")

      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado." })
      }

      const perfil = await Usuario.findById(id).populate("profile")
      const userProfile = (perfil?.profile as IProfile).name
      const declaracoesUsuario = await Declaracoes.find({
        ultimaDeclaracao: true,
        responsavelEnvio: id,
        status: { $ne: Status.Excluida }
      })

      if (userProfile === "declarant" && declaracoesUsuario.length > 0) {
        throw new HTTPError(
          "Não é possível excluir o usuário porque ele está vinculado a declarações.",
          422
        )
      }

      const possuiDeclaracoesComoAnalista = await Declaracoes.exists({
        $or: [
          { "arquivistico.analistasResponsaveis": id },
          { "bibliografico.analistasResponsaveis": id },
          { "museologico.analistasResponsaveis": id }
        ]
      })

      if (userProfile === "analyst" && possuiDeclaracoesComoAnalista) {
        throw new HTTPError(
          "Não é possível excluir um analista que tenha participado de análises",
          422
        )
      }

      const possuiDeclaracoesComoAdmin = await Declaracoes.exists({
        $or: [{ responsavelEnvioAnalise: id }]
      })

      if (userProfile === "admin" && possuiDeclaracoesComoAdmin) {
        throw new HTTPError(
          "Não é possível excluir um administrador que restaurou ou encaminhou declarações para análise",
          422
        )
      }

      usuario.situacao = SituacaoUsuario.Inativo
      await usuario.save()

      return res
        .status(200)
        .json({ message: "Usuário desativado com sucesso." })
    } catch (error) {
      logger.error("Erro ao deletar usuário:", error)

      if (error instanceof HTTPError) {
        return res.status(error.status).json({ message: error.message })
      }

      return res.status(500).json({ message: "Erro ao deletar usuário." })
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
          .json({ message: "Nenhum usuário encontrado para este perfil." })
      }
      return res.status(200).json(usuarios)
    } catch (error) {
      logger.error("Erro ao listar usuários por perfil:", error)
      return res
        .status(500)
        .json({ message: "Erro ao listar usuários por perfil." })
    }
  }

  async getDocumento(req: Request, res: Response) {
    const { id } = req.params

    try {
      const usuario = await Usuario.findById(id)

      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado." })
      }

      if (!usuario.documentoComprobatorio || usuario.documentoComprobatorio == null) {
        return res.status(404).json({ message: "Erro ao buscar documento" })
      }

      const url = await minioClient.presignedUrl(
        "GET",
        "inbcm",
        usuario.documentoComprobatorio
      )

      return res.status(200).json({ url })
    } catch (error) {
      logger.error("Erro ao buscar documento:", error)
      return res.status(500).json({ message: "Erro ao buscar documento." })
    }
  }
}

export default new UsuarioController()
