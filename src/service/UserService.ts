import argon2 from "@node-rs/argon2"
import { Usuario } from "../models/Usuario"
import { IProfile, Profile } from "../models/Profile"
import { Types } from "mongoose"
import { IMuseu } from "../models"
import HTTPError from "../utils/error"

export class UsuarioService {
  /**
   * Valida as informações do usuário antes de criar.
   * @param email Email do usuário.
   * @param profile ID do perfil do usuário.
   * @param especialidadeAnalista Tipo de analista (opcional).
   */
  static async validarUsuario({
    email,
    profile,
    cpf,
    especialidadeAnalista
  }: {
    email: string
    profile: string
    cpf: string
    especialidadeAnalista?: string[]
  }) {
    let usuarioExistente = await Usuario.findOne({ email })
    if (usuarioExistente) {
      throw new HTTPError("Email já está em uso.", 400)
    }
    usuarioExistente = await Usuario.findOne({ cpf })
    if (usuarioExistente) {
      throw new HTTPError("Cpf já cadastrado no sistema", 400)
    }

    const perfilExistente = await Profile.findById(profile)
    if (!perfilExistente) {
      throw new HTTPError("Perfil não encontrado.", 404)
    }

    if (perfilExistente.name === "analyst") {
      if (
        !especialidadeAnalista ||
        !Array.isArray(especialidadeAnalista) ||
        especialidadeAnalista.some(
          (tipo) =>
            !["museologico", "arquivistico", "bibliografico"].includes(tipo)
        )
      ) {
        throw new HTTPError(
          "O tipo de analista deve ser fornecido como um array e conter apenas os seguintes valores: museologico, arquivistico, bibliografico.",
          400
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
   * @param especialidadeAnalista Tipo de analista (opcional).
   */
  static async criarUsuario({
    nome,
    email,
    senha,
    profile,
    especialidadeAnalista,
    cpf
  }: {
    nome: string
    email: string
    senha: string
    cpf: string
    profile: string
    especialidadeAnalista?: string[]
  }) {
    const senhaHash = await argon2.hash(senha)

    const novoUsuario = new Usuario({
      nome,
      email,
      senha: senhaHash,
      profile,
      cpf,
      ativo: true,
      especialidadeAnalista
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
   * Busca usuários com   filtro de perfil.
   * @param perfil Perfis a serem filtrados.
   * @returns Lista de usuários
   */
  static async buscarUsuarios(perfil: string[] = []) {
    const query: {
      ativo: boolean
      profile?: Types.ObjectId[] | { $in: Types.ObjectId[] }
    } = { ativo: true }

    if (perfil && perfil.length > 0) {
      const profiles = await Profile.find({ name: { $in: perfil } })
      if (profiles.length === 0) {
        throw new HTTPError("Perfis fornecidos são inválidos.", 400)
      }

      query.profile = { $in: profiles.map((p) => p._id as Types.ObjectId) }
    }

    const usuarios = await Usuario.find(query)
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
      //     path: "declaracoes",
      //   });
      // }
    }

    return usuarios
  }
}
