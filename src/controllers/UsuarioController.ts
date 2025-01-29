import { Request, Response } from "express"
import Usuario, { validarCPF } from "../models/Usuario"
import logger from "../utils/logger"
import { UsuarioService } from "../service/UserService"
import { Declaracoes, Museu } from "../models"
import { Profile } from "../models/Profile"
import { Types } from "mongoose"
import { UpdateUserDto } from "../models/dto/UserDto"

class UsuarioController {
  async registerUsuario(req: Request, res: Response) {
    const { nome, email, senha, cpf, profile, especialidadeAnalista, museus } =
      req.body

    if (!nome || !email || !senha || !profile || !cpf) {
      return res.status(400).json({
        mensagem: "Nome, email, senha e perfil são obrigatórios."
      })
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
        mensagem: "Usuário criado com sucesso.",
        usuario: novoUsuario
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error("Erro ao criar usuário:", error)
        return res.status(400).json({ mensagem: error.message })
      }

      logger.error("Erro inesperado:", error)
      return res.status(500).json({
        mensagem: "Erro desconhecido ao criar usuário."
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

  async getUsuario(req: Request, res: Response) {
    const userId = req.user?.id

    try {
      const usuario = await Usuario.findById(userId)
        .populate("museus")
        .populate("profile", "name _id")
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
    try {
      const { id } = req.params
      const {
        nome,
        email,
        perfil,
        especialidadeAnalista,
        museus,
        desvincularMuseus,
        cpf
      }: UpdateUserDto = req.body

      const usuario = await Usuario.findById(id)

      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." })
      }

      if (nome) {
        usuario.nome = nome
      }

      if (email) {
        usuario.email = email
      }

      if (perfil) {
        const perfilValido = await Profile.findOne({ name: perfil }).exec()

        if (!perfilValido) {
          return res
            .status(400)
            .json({ mensagem: "O perfil informado é inválido." })
        }
        usuario.profile = perfilValido._id as Types.ObjectId
      }

      // Atualizando CPF, se fornecido e diferente do existente
      if (cpf && cpf !== usuario.cpf) {
        const cpfFormatado = cpf.replace(/\D/g, "")

        if (!validarCPF(cpfFormatado)) {
          return res.status(400).json({ mensagem: "CPF inválido." })
        }
        usuario.cpf = cpfFormatado
      }

      // Atualizando museus, se fornecido
      if (museus && Array.isArray(museus)) {
        const resultadosVinculacao = []
        for (const museuId of museus) {
          if (!museuId.match(/^[a-fA-F0-9]{24}$/)) {
            resultadosVinculacao.push({
              museuId,
              mensagem: "ID do museu inválido."
            })
            continue
          }

          const museu = await Museu.findById(museuId)

          if (!museu) {
            resultadosVinculacao.push({
              museuId,
              mensagem: "Museu não encontrado."
            })
            continue
          }

          if (museu.usuario) {
            resultadosVinculacao.push({
              museuId,
              mensagem: "Este museu já possui um usuário associado."
            })
            continue
          }

          museu.usuario = new Types.ObjectId(id)
          await museu.save()

          if (!usuario.museus.includes(museuId)) {
            usuario.museus.push(museuId)
          }

          resultadosVinculacao.push({
            museuId,
            mensagem: "Usuário vinculado ao museu com sucesso."
          })
        }

        await usuario.save()
        return res.status(200).json({
          mensagem: "Processo de vinculação concluído.",
          resultadosVinculacao
        })
      }

      // Atualizando desvinculação de museus, se fornecido
      if (desvincularMuseus && Array.isArray(desvincularMuseus)) {
        const resultadosDesvinculacao = []
        for (const museuId of desvincularMuseus) {
          const museu = await Museu.findById(museuId)

          if (!museu) {
            resultadosDesvinculacao.push({
              museuId,
              mensagem: "Museu não encontrado."
            })
            continue
          }

          if (museu.usuario && !museu.usuario.equals(new Types.ObjectId(id))) {
            resultadosDesvinculacao.push({
              museuId,
              mensagem: "Este museu não está vinculado a este usuário."
            })
            continue
          }

          museu.usuario = null
          await museu.save()

          usuario.museus = usuario.museus.filter(
            (id) => id.toString() !== museuId.toString()
          )

          resultadosDesvinculacao.push({
            museuId,
            mensagem: "Usuário desvinculado do museu com sucesso."
          })
        }

        await usuario.save()
        return res.status(200).json({
          mensagem: "Processo de desvinculação concluído.",
          resultadosDesvinculacao
        })
      }

      // Atualiza as especialidades do analista (somente para perfis `analyst`)
      if (especialidadeAnalista) {
        const perfilAtual = await Profile.findById(usuario.profile)
        if (perfilAtual?.name !== "analyst") {
          return res.status(400).json({
            mensagem:
              "Apenas usuários com o perfil 'analyst' podem ter especialidades."
          })
        }

        if (!Array.isArray(especialidadeAnalista)) {
          return res.status(400).json({
            mensagem: "O campo especialidadeAnalista deve ser um array."
          })
        }

        const especialidadesRemovidas = usuario.especialidadeAnalista.filter(
          (especialidade) => !especialidadeAnalista.includes(especialidade)
        )

        for (const especialidade of especialidadesRemovidas) {
          const declaracoesEmAnalise = await Declaracoes.find({
            status: "Em análise",
            tipo: especialidade,
            analista: id
          })

          if (declaracoesEmAnalise.length > 0) {
            return res.status(400).json({
              mensagem: `Não é possível remover a especialidade '${especialidade}' porque o analista está vinculado a declarações com status 'Em análise'.`
            })
          }
        }

        usuario.especialidadeAnalista = especialidadeAnalista
      }

      await usuario.save()

      return res.status(200).json({
        mensagem: "Usuário atualizado com sucesso.",
        usuario
      })
    } catch (erro) {
      return res.status(500).json({ mensagem: "Erro ao atualizar o usuário." })
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
