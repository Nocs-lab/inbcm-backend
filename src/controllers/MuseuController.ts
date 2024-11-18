import { Request, Response } from "express"
import { Museu } from "../models"

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
      const museus = await Museu.find()
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
      return res.status(500).json({ mensagem: "Erro ao listar municípios e estados." })
    }
  }
}

export default MuseuController
