import { Request, Response } from "express"
import { Museu, Usuario } from "../models"

class MuseuController {
  // Método para criar um novo museu
  static async criarMuseu(req: Request, res: Response) {
    try {
      const { nome, endereco, codIbram, esferaAdministraiva, usuario } =
        req.body

      if (
        !nome ||
        !endereco ||
        !endereco.cidade ||
        !endereco.logradouro ||
        !endereco.numero
      ) {
        return res.status(400).json({
          mensagem: "Todos os campos obrigatórios devem ser preenchidos."
        })
      }
      const novoMuseu = new Museu({
        nome,
        endereco,
        codIbram,
        esferaAdministraiva,
        usuario
      })

      await novoMuseu.save()

      return res
        .status(201)
        .json({ mensagem: "Museu criado com sucesso!", museu: novoMuseu })
    } catch (erro) {
      console.error("Erro ao criar museu:", erro)
      return res.status(500).json({ mensagem: "Erro ao criar museu." })
    }
  }

  static async listarMuseus(req: Request, res: Response) {
    try {
      // Obtém o parâmetro booleano da query string
      const { semVinculoUsuario } = req.query

      // Verifica o valor do parâmetro e ajusta o filtro
      const filtro = semVinculoUsuario === "true" ? { usuario: null } : {}

      // Busca os museus com base no filtro
      const museus = await Museu.find(filtro)

      return res.status(200).json(museus)
    } catch (erro) {
      console.error("Erro ao listar museus:", erro)
      return res.status(500).json({ mensagem: "Erro ao listar museus." })
    }
  }

  static async userMuseus(req: Request, res: Response) {
    try {
      const user_id = req.user.id
      const museus = await Museu.find({ usuario: user_id })
      return res.status(200).json(museus)
    } catch (erro) {
      console.error("Erro ao listar museus do usuário:", erro)
      return res
        .status(500)
        .json({ mensagem: "Erro ao listar museus do usuário." })
    }
  }

  static async listarMunicipios(req: Request, res: Response) {
    try {
      // Usando agregação para obter os municípios e estados em formato chave-valor
      const municipiosEstados = await Museu.aggregate([
        {
          $group: {
            _id: { municipio: "$endereco.municipio", estado: "$endereco.uf" }
          }
        },
        {
          $project: {
            municipio: "$_id.municipio",
            estado: "$_id.estado",
            _id: 0
          }
        }
      ])

      return res.status(200).json(municipiosEstados)
    } catch (erro) {
      console.error("Erro ao listar municípios e estados:", erro)
      return res
        .status(500)
        .json({ mensagem: "Erro ao listar municípios e estados." })
    }
  }
  static async desvincularUsuarioDoMuseu(req: Request, res: Response) {
    try {
      const { museuId } = req.body

      if (!museuId) {
        return res.status(400).json({
          mensagem: "O ID do museu é obrigatório."
        })
      }

      const museu = await Museu.findById(museuId)

      if (!museu) {
        return res.status(404).json({ mensagem: "Museu não encontrado." })
      }

      if (!museu.usuario) {
        return res.status(400).json({
          mensagem: "Este museu não possui um usuário vinculado."
        })
      }

      const usuarioId = museu.usuario

      museu.usuario = null
      await museu.save()

      const usuario = await Usuario.findById(usuarioId)

      if (usuario) {
        usuario.museus = usuario.museus.filter(
          (id) => id.toString() !== museuId
        )
        await usuario.save()
      }

      return res.status(200).json({
        mensagem: "Usuário desvinculado do museu com sucesso.",
        museu
      })
    } catch (erro) {
      console.error("Erro ao desvincular usuário do museu:", erro)
      return res
        .status(500)
        .json({ mensagem: "Erro ao desvincular usuário do museu." })
    }
  }

  static async vincularUsuarioAoMuseu(req: Request, res: Response) {
    try {
      const { museuId, usuarioId } = req.body

      if (!museuId || !usuarioId) {
        return res.status(400).json({
          mensagem: "O ID do museu e o ID do usuário são obrigatórios."
        })
      }

      const museu = await Museu.findById(museuId)

      if (!museu) {
        return res.status(404).json({ mensagem: "Museu não encontrado." })
      }

      if (museu.usuario) {
        return res.status(400).json({
          mensagem: "Este museu já possui um usuário associado."
        })
      }

      museu.usuario = usuarioId
      await museu.save()

      const usuario = await Usuario.findById(usuarioId)

      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." })
      }

      if (!usuario.museus.includes(museuId)) {
        usuario.museus.push(museuId)
        await usuario.save()
      }

      return res.status(200).json({
        mensagem: "Usuário vinculado ao museu com sucesso.",
        museu
      })
    } catch (erro) {
      console.error("Erro ao vincular usuário ao museu:", erro)
      return res
        .status(500)
        .json({ mensagem: "Erro ao vincular usuário ao museu." })
    }
  }
}

export default MuseuController
