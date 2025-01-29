import { Request, Response } from "express"
import Usuario from "../models/Usuario"
import logger from "../utils/logger"
import { UsuarioService } from "../service/UserService"
import { Declaracoes, Museu } from "../models"
import { Profile } from "../models/Profile"
import { Types } from "mongoose"

class UsuarioController {
  async registerUsuario(req: Request, res: Response) {
    const { nome, email, senha, cpf, profile, especialidadeAnalista } = req.body

    if (!nome || !email || !senha || !profile || !cpf) {
      return res
        .status(400)
        .json({ mensagem: "Nome, email, senha e perfil são obrigatórios." })
    }

    try {
      const perfilExistente = await UsuarioService.validarUsuario({
        email,
        profile,
        especialidadeAnalista,
        cpf
      })

      let especialidades = especialidadeAnalista // Dessa forma,possibilida o Admin conseguir analisar declarações.

      if (perfilExistente.name === "admin") {
        especialidades = ["museologico", "arquivistico", "bibliografico"]
      }

      // Cria o usuário
      await UsuarioService.criarUsuario({
        nome,
        email,
        senha,
        profile,
        cpf,
        especialidadeAnalista: especialidades
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
        // museus,
        especialidadeAnalista,
        museus,
        desvincularMuseus
      } = req.body

      const usuario = await Usuario.findById(id)

      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." })
      }

      if (nome) usuario.nome = nome
      if (email) usuario.email = email

      if (perfil) {
        const perfilValido = await Profile.findOne({ name: perfil }).exec()
        if (!perfilValido) {
          return res
            .status(400)
            .json({ mensagem: "O perfil informado é inválido." })
        }
        usuario.profile = perfilValido._id as Types.ObjectId
      }

      // if (museus) {
      //   if (!Array.isArray(museus)) {
      //     return res
      //       .status(400)
      //       .json({ mensagem: "O campo museus deve ser um array." })
      //   }

      //   const perfilAtual = await Profile.findById(usuario.profile)
      //   if (perfilAtual?.name !== "declarant") {
      //     return res.status(400).json({
      //       mensagem:
      //         "Apenas usuários com o perfil 'declarant' podem ter museus vinculados."
      //     })
      //   }

      //   const resultados = []

      //   // Verificação e remoção dos museus
      //   for (const museuId of museus) {
      //     if (!museuId.match(/^[a-fA-F0-9]{24}$/)) {
      //       resultados.push({ museuId, mensagem: "ID do museu inválido." })
      //       continue
      //     }

      //     const museu = await Museu.findById(museuId)
      //     if (!museu) {
      //       resultados.push({ museuId, mensagem: "Museu não encontrado." })
      //       continue
      //     }

      //     if (museu.usuario && museu.usuario.toString() !== usuarioId) {
      //       resultados.push({
      //         museuId,
      //         mensagem: "O museu já está associado a outro usuário."
      //       })
      //       continue
      //     }

      //     museu.usuario = null
      //     await museu.save()

      //     usuario.museus = usuario.museus.filter(
      //       (id) => id.toString() !== museuId.toString()
      //     )
      //   }

      //   await usuario.save()
      // }

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
      logger.error("Erro ao atualizar usuário:", erro)
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
