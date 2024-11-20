import { Request, Response } from "express"
import { Museu, Usuario } from "../models"

class MuseuController {
  /**
   * @swagger
   * /museus:
   *   post:
   *     summary: Cria um novo museu
   *     tags:
   *       - Museus
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nome:
   *                 type: string
   *               endereco:
   *                 type: object
   *                 properties:
   *                   cidade:
   *                     type: string
   *                   logradouro:
   *                     type: string
   *                   numero:
   *                     type: string
   *               codIbram:
   *                 type: string
   *               esferaAdministraiva:
   *                 type: string
   *               usuario:
   *                 type: string
   *     responses:
   *       201:
   *         description: Museu criado com sucesso
   *       400:
   *         description: Dados obrigatórios ausentes
   *       500:
   *         description: Erro no servidor
   */
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
  /**
   * @swagger
   * /museus:
   *   get:
   *     summary: Lista museus com suporte à paginação e filtros
   *     tags:
   *       - Museus
   *     parameters:
   *       - in: query
   *         name: semVinculoUsuario
   *         schema:
   *           type: boolean
   *         description: Filtrar museus sem usuário vinculado
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Itens por página
   *     responses:
   *       200:
   *         description: Lista de museus
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 museus:
   *                   type: array
   *                   items:
   *                     type: object
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     currentPage:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *                     totalItems:
   *                       type: integer
   *                     itemsPerPage:
   *                       type: integer
   *       500:
   *         description: Erro ao listar museus
   */
  static async listarMuseus(req: Request, res: Response) {
    try {
      const { semVinculoUsuario, page, limit } = req.query

      // Verifica o valor do parâmetro `semVinculoUsuario` e ajusta o filtro
      const filtro = semVinculoUsuario === "true" ? { usuario: null } : {}

      // Caso `page` e `limit` não sejam fornecidos, retorna todos os museus
      if (!page && !limit) {
        const museus = await Museu.find(filtro)
        return res.status(200).json(museus)
      }

      // Calcula paginação caso `page` e `limit` sejam fornecidos
      const pageNumber = parseInt(page as string, 10) || 1
      const limitNumber = parseInt(limit as string, 10) || 10
      const skip = (pageNumber - 1) * limitNumber

      // Consulta paginada
      const museus = await Museu.find(filtro).skip(skip).limit(limitNumber)

      // Contagem total para paginação
      const totalMuseus = await Museu.countDocuments(filtro)
      const totalPages = Math.ceil(totalMuseus / limitNumber)

      return res.status(200).json({
        museus,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalItems: totalMuseus,
          itemsPerPage: limitNumber
        }
      })
    } catch (erro) {
      console.error("Erro ao listar museus:", erro)
      return res.status(500).json({ mensagem: "Erro ao listar museus." })
    }
  }

  /**
   * @swagger
   * /museus/usuario:
   *   get:
   *     summary: Lista os museus associados ao usuário autenticado.
   *     tags:
   *       - Museus
   *     responses:
   *       200:
   *         description: Lista de museus do usuário.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Museu'
   *       500:
   *         description: Erro interno ao listar museus do usuário.
   */
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
  /**
   * @swagger
   * /museus/municipios:
   *   get:
   *     summary: Lista os municípios e estados onde os museus estão localizados.
   *     tags:
   *       - Museus
   *     responses:
   *       200:
   *         description: Lista de municípios e estados.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   municipio:
   *                     type: string
   *                     description: Nome do município.
   *                   estado:
   *                     type: string
   *                     description: UF do estado.
   *       500:
   *         description: Erro interno ao listar municípios e estados.
   */
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
  } /**
   * @swagger
   * /museus/desvincular-usuario:
   *   post:
   *     summary: Desvincula um usuário de um museu específico.
   *     tags:
   *       - Museus
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               museuId:
   *                 type: string
   *                 description: ID do museu a ser desvinculado.
   *     responses:
   *       200:
   *         description: Usuário desvinculado do museu com sucesso.
   *       400:
   *         description: Parâmetros inválidos ou erro de validação.
   *       404:
   *         description: Museu ou usuário não encontrado.
   *       500:
   *         description: Erro interno ao desvincular usuário.
   */
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
  /**
   * @swagger
   * /museus/vincular-usuario:
   *   post:
   *     summary: Vincula um usuário a um museu específico.
   *     tags:
   *       - Museus
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               museuId:
   *                 type: string
   *                 description: ID do museu.
   *               usuarioId:
   *                 type: string
   *                 description: ID do usuário.
   *     responses:
   *       200:
   *         description: Usuário vinculado ao museu com sucesso.
   *       400:
   *         description: Parâmetros inválidos ou erro de validação.
   *       404:
   *         description: Museu ou usuário não encontrado.
   *       500:
   *         description: Erro interno ao vincular usuário.
   */
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
