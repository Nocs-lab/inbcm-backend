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

class UsuarioController {
  async registerUsuarioExterno(req: Request, res: Response) {
    const { nome, email, cpf, museus } = req.body
    console.log(nome, email, cpf, museus)

    try {
      await UsuarioService.validarUsuarioExterno({
        nome,
        email,
        profile: "declarant",
        cpf
      })

      const novoUsuario = await UsuarioService.criarUsuarioExterno({
        nome,
        email,
        cpf,
        museus
      })

      return res.status(201).json({
        message:
          "Pedido de acesso ao sistema INBCM feito com sucesso. Aguarde análise.",
        usuario: novoUsuario
      })
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({
        message: "Erro desconhecido ao criar usuário externo."
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
      if (error instanceof Error) {
        logger.error("Erro ao criar usuário:", error)
        return res.status(400).json({ message: error.message })
      }

      logger.error("Erro inesperado:", error)
      return res.status(500).json({
        message: "Erro desconhecido ao criar usuário."
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
      return res.status(500).json({ message: "Erro ao listar usuários." })
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
      if (situacao !== undefined) {
        if (!Object.values(SituacaoUsuario).includes(situacao)) {
          throw new HTTPError("Usuário não está ativo.", 400)
        }
        usuario.situacao = situacao
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
            .json({ message: "O perfil informado é inválido." })
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
        const resultadosVinculacao = []
        for (const museuId of museus) {
          if (!museuId.match(/^[a-fA-F0-9]{24}$/)) {
            resultadosVinculacao.push({
              museuId,
              message: "ID do museu inválido."
            })
            continue
          }

          const museu = await Museu.findById(museuId)

          if (!museu) {
            resultadosVinculacao.push({
              museuId,
              message: "Museu não encontrado."
            })
            continue
          }

          if (museu.usuario) {
            resultadosVinculacao.push({
              museuId,
              message: "Este museu já possui um usuário associado."
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
            message: "Usuário vinculado ao museu com sucesso."
          })
        }

        await usuario.save()
        return res.status(200).json({
          message: "Processo de vinculação concluído.",
          resultadosVinculacao
        })
      }

      // Desvincula museus, se fornecido
      if (desvincularMuseus && Array.isArray(desvincularMuseus)) {
        const resultadosDesvinculacao = []
        for (const museuId of desvincularMuseus) {
          const museu = await Museu.findById(museuId)

          if (!museu) {
            resultadosDesvinculacao.push({
              museuId,
              message: "Museu não encontrado."
            })
            continue
          }

          if (museu.usuario && !museu.usuario.equals(new Types.ObjectId(id))) {
            resultadosDesvinculacao.push({
              museuId,
              message: "Este museu não está vinculado a este usuário."
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
            message: "Usuário desvinculado do museu com sucesso."
          })
        }

        await usuario.save()
        return res.status(200).json({
          message: "Processo de desvinculação concluído.",
          resultadosDesvinculacao
        })
      }

      // Atualiza as especialidades do analista
      if (especialidadeAnalista) {
        const perfilAtual = await Profile.findById(usuario.profile)
        if (perfilAtual?.name !== "analyst") {
          return res.status(400).json({
            message:
              "Apenas usuários com o perfil 'analyst' podem ter especialidades."
          })
        }

        if (!Array.isArray(especialidadeAnalista)) {
          return res.status(400).json({
            message: "O campo especialidadeAnalista deve ser um array."
          })
        }

        // Validação de especialidades permitidas (opcional)
        const especialidadesPermitidas = [
          "museologico",
          "bibliografico",
          "arquivistico"
        ]
        const especialidadesInvalidas = especialidadeAnalista.filter(
          (especialidade) => !especialidadesPermitidas.includes(especialidade)
        )
        if (especialidadesInvalidas.length > 0) {
          return res.status(400).json({
            message: `As seguintes especialidades são inválidas: ${especialidadesInvalidas.join(", ")}`
          })
        }

        if (especialidadeAnalista.length === 0) {
          return res.status(400).json({
            message: "O analista deve ter pelo menos uma especialidade."
          })
        }

        const especialidadesAtuais = usuario.especialidadeAnalista
        const especialidadesAdicionadas = especialidadeAnalista.filter(
          (especialidade) => !especialidadesAtuais.includes(especialidade)
        )
        const especialidadesRemovidas = especialidadesAtuais.filter(
          (especialidade) => !especialidadeAnalista.includes(especialidade)
        )

        for (const especialidade of especialidadesRemovidas) {
          const declaracoesEmAnalise = await Declaracoes.find({
            status: Status.EmAnalise,
            $or: [
              {
                "arquivistico.analistasResponsaveis": id,
                "arquivistico.tipo": especialidade
              },
              {
                "bibliografico.analistasResponsaveis": id,
                "bibliografico.tipo": especialidade
              },
              {
                "museologico.analistasResponsaveis": id,
                "museologico.tipo": especialidade
              }
            ]
          })

          if (declaracoesEmAnalise.length > 0) {
            return res.status(400).json({
              message: `Não é possível remover a especialidade '${especialidade}' porque o analista está vinculado a declarações com status 'Em análise'.`
            })
          }
        }

        usuario.especialidadeAnalista = especialidadeAnalista
        await usuario.save()

        return res.status(200).json({
          message: "Especialidades atualizadas com sucesso.",
          especialidadesAdicionadas,
          especialidadesRemovidas
        })
      }

      await usuario.save()

      return res.status(200).json({
        message: "Usuário atualizado com sucesso.",
        usuario
      })
    } catch (erro) {
      return res.status(500).json({ message: "Erro ao atualizar o usuário." })
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

      if (userProfile === "declarant" && usuario.museus.length > 0) {
        throw new HTTPError(
          "Não é possível excluir um declarante com museus associados. Desassocie os museus para realizar a exclusão.",
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
}

export default new UsuarioController()
