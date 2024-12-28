import argon2 from "@node-rs/argon2"
import { Usuario } from "../models/Usuario"
import { IProfile, Profile } from "../models/Profile"
import { Types } from "mongoose"
import { IMuseu } from "../models"

export class UsuarioService {
  /**
   * Valida as informações do usuário antes de criar.
   * @param email Email do usuário.
   * @param profile ID do perfil do usuário.
   * @param tipoAnalista Tipo de analista (opcional).
   */
  static async validarUsuario({
    email,
    profile,
    tipoAnalista
  }: {
    email: string
    profile: string
    tipoAnalista?: string[]
  }) {
    const usuarioExistente = await Usuario.findOne({ email })
    if (usuarioExistente) {
      throw new Error("Email já está em uso.")
    }

    const perfilExistente = await Profile.findById(profile)
    if (!perfilExistente) {
      throw new Error("Perfil não encontrado.")
    }

    if (perfilExistente.name === "analyst") {
      if (
        !tipoAnalista ||
        !Array.isArray(tipoAnalista) ||
        tipoAnalista.some(
          (tipo) =>
            !["museologico", "arquivistico", "bibliografico"].includes(tipo)
        )
      ) {
        throw new Error(
          "O tipo de analista deve ser fornecido como um array e conter apenas os seguintes valores: museologico, arquivistico, bibliografico."
        )
      }
    }

    return perfilExistente
  }

  /**
   * Cria um novo usuário na base de dados.
   * @param nome Nome do usuário.
   * @param email Email do usuário.
   * @param senha Senha do usuário.
   * @param profile ID do perfil do usuário.
   * @param tipoAnalista Tipo de analista (opcional).
   */
  static async criarUsuario({
    nome,
    email,
    senha,
    profile,
    tipoAnalista
  }: {
    nome: string
    email: string
    senha: string
    profile: string
    tipoAnalista?: string[]
  }) {
    const senhaHash = await argon2.hash(senha)

    const novoUsuario = new Usuario({
      nome,
      email,
      senha: senhaHash,
      profile,
      ativo: true,
      tipoAnalista
    })

    await novoUsuario.save()

    return novoUsuario
  }

  /**
   * Função para paginar resultados de consultas.
   * @param query Consulta MongoDB (mongoose query) que será paginada.
   * @param page Número da página (default: 1).
   * @param limit Limite de itens por página (default: 10).
   * @returns Resultados paginados.
   */

  /**
   * Busca usuários com paginação e filtro de perfil.
   * @param perfil Perfis a serem filtrados.
   * @param page Número da página.
   * @param limit Limite de itens por página.
   * @returns Lista de usuários com paginação.
   */
  static async buscarUsuarios(
    perfil: string[],
    page: number = 1,
    limit: number = 10
  ) {
    const query: {
      ativo: boolean
      profile?: Types.ObjectId[] | { $in: Types.ObjectId[] }
    } = { ativo: true }

    if (perfil && perfil.length > 0) {
      const profiles = await Profile.find({ name: { $in: perfil } })
      if (profiles.length === 0) {
        throw new Error("Perfis fornecidos são inválidos.")
      }

      query.profile = { $in: profiles.map((p) => p._id as Types.ObjectId) }
    }

    // Conta o total de usuários que atendem ao filtro
    const totalDocs = await Usuario.countDocuments(query)

    // Calcula a páginação
    const skip = (page - 1) * limit
    const usuarios = await Usuario.find(query)
      .skip(skip)
      .limit(limit)
      .populate("profile")
      .populate("museus")

    for (const usuario of usuarios) {
      if (
        usuario.profile &&
        (usuario.profile as IProfile).name === "declarant"
      ) {
        usuario.museus = usuario.museus as IMuseu[]
      }

      // if (usuario.profile && (usuario.profile as IProfile).name === "analyst") {
      //   usuario.declaracoes = await Usuario.populate(usuario, {
      //     path: "declaracoes"
      //   })
      // }
    }

    const totalPages = Math.ceil(totalDocs / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      docs: usuarios,
      totalDocs,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  }
}
