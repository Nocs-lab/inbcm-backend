import argon2 from "@node-rs/argon2"
import { SituacaoUsuario, Usuario } from "../models/Usuario"
import { IProfile, Profile } from "../models/Profile"
import { Types } from "mongoose"
import { IMuseu, Museu } from "../models"
import HTTPError from "../utils/error"
import { z } from "zod"
import { sendEmail } from "../emails"
import minioClient from "../db/minioClient"
import { randomUUID } from "crypto"
import { DataUtils } from "../utils/dataUtils"
import config from "../config"

const usuarioExternoSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("E-mail inválido."),
  profile: z.string().min(1, "O perfil é obrigatório."),
  cpf: z.string().min(11, "CPF inválido.")
})

export class UsuarioService {
  static async criarUsuarioExterno({
    nome,
    email,
    cpf,
    museus,
    arquivo
  }: {
    nome: string
    email: string
    cpf: string
    museus: string[]
    senha?: string
    arquivo: Express.Multer.File
  }) {
    // Valida museus
    const museusValidos: string[] = []
    const erros: { museuId: string; message: string }[] = []

    for (const id of museus) {
      if (!id.match(/^[a-fA-F0-9]{24}$/)) {
        erros.push({ museuId: id, message: "ID do museu inválido." })
        continue
      }

      const museu = await Museu.findById(id)

      if (!museu) {
        erros.push({ museuId: id, message: "Museu não encontrado." })
        continue
      }

      if (museu.usuario) {
        erros.push({
          museuId: id,
          message: "Este museu já possui um usuário associado."
        })
        continue
      }

      museusValidos.push(id)
    }

    if (erros.length > 0) {
      throw new HTTPError(
        `Falha ao associar museus: ${JSON.stringify(erros)}`,
        500
      )
    }
    const perfilDeclarant = await Profile.findOne({ name: "declarant" })
    if (!perfilDeclarant) {
      throw new HTTPError("Perfil 'declarant' não encontrado.", 500)
    }

    const documentoComprobatorio = `documentos/${email}/${randomUUID()}/${arquivo.originalname}`
    await minioClient.putObject(
      "inbcm",
      documentoComprobatorio,
      arquivo.buffer,
      arquivo.size,
      {
        "Content-Type": arquivo.mimetype
      }
    )

    const novoUsuario = new Usuario({
      nome,
      email,
      cpf,
      profile: perfilDeclarant._id,
      situacao: SituacaoUsuario.ParaAprovar,
      museus: museusValidos,
      documentoComprobatorio
    })

    await novoUsuario.save()

    await Museu.updateMany(
      { _id: { $in: museusValidos } },
      { $set: { usuario: novoUsuario._id } }
    )

    // Envio e-mail para o usuário solicitante
    await sendEmail("solicitar-acesso", email, { name: nome })

    // Envio de e-mail para os administradores informando novo usuário solicitando acesso
    const usuarios = await Usuario.find({ ativo: true }).populate<{ profile: IProfile }>("profile");
    const emails = usuarios
      .filter(usuario => usuario.profile?.name === "admin")
      .map(usuario => usuario.email);
    const urlGestaoUsuario =  `${config.ADMIN_SITE_URL}/usuarios`
    const horario = `${DataUtils.gerarDataFormatada()} às ${DataUtils.gerarHoraFormatada()}`
    await sendEmail("novo-usuario-admin", emails, { nome, email, horario, url: urlGestaoUsuario})

    return novoUsuario
  }

  static async validarUsuarioExterno({
    nome,
    email,
    profile,
    cpf
  }: {
    nome: string
    email: string
    profile: string
    cpf: string
  }) {
    const resultadoValidacao = usuarioExternoSchema.safeParse({
      nome,
      email,
      profile,
      cpf
    })
    if (!resultadoValidacao.success) {
      throw new HTTPError(resultadoValidacao.error.errors[0].message, 422)
    }
    let usuarioExistente = await Usuario.findOne({ email })
    if (usuarioExistente) {
      if (usuarioExistente.situacao === SituacaoUsuario.ParaAprovar) {
        throw new HTTPError(
          "Solicitação de acesso à plataforma está em análise.",
          422
        )
      }
      throw new HTTPError("E-mail já cadastrado no sistema.", 400)
    }

    usuarioExistente = await Usuario.findOne({ cpf })
    if (usuarioExistente) {
      if (usuarioExistente.situacao === SituacaoUsuario.ParaAprovar) {
        throw new HTTPError(
          "Solicitação de acesso à plataforma está em análise.",
          422
        )
      }
      throw new HTTPError("CPF já cadastrado no sistema.", 400)
    }
    // Verifica se o perfil existe pelo nome
    const perfilExistente = await Profile.findOne({ name: profile })
    if (!perfilExistente) {
      throw new HTTPError("Perfil não encontrado.", 404)
    }

    // Verifica se o perfil é do tipo "declarant"
    if (perfilExistente.name !== "declarant") {
      throw new HTTPError(
        "Cadastro externo apenas para perfis declarantes.",
        422
      )
    }
  }
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
    cpf,
    profile,
    especialidadeAnalista,
    museus
  }: {
    nome: string
    email: string
    senha: string
    cpf: string
    profile: string
    especialidadeAnalista?: string[]
    museus: string[]
  }) {
    const senhaHash = await argon2.hash(senha)

    // Valida museus
    const museusValidos: string[] = []
    const erros: { museuId: string; message: string }[] = []

    for (const id of museus) {
      if (!id.match(/^[a-fA-F0-9]{24}$/)) {
        erros.push({ museuId: id, message: "ID do museu inválido." })
        continue
      }

      const museu = await Museu.findById(id)

      if (!museu) {
        erros.push({ museuId: id, message: "Museu não encontrado." })
        continue
      }

      if (museu.usuario) {
        erros.push({
          museuId: id,
          message: "Este museu já possui um usuário associado."
        })
        continue
      }

      museusValidos.push(id)
    }

    if (erros.length > 0) {
      throw new Error(`Falha ao associar museus: ${JSON.stringify(erros)}`)
    }

    const novoUsuario = new Usuario({
      nome,
      email,
      senha: senhaHash,
      profile,
      cpf,
      situacao: SituacaoUsuario.Ativo,
      especialidadeAnalista,
      museus: museusValidos
    })

    await novoUsuario.save()

    // Atualiza os museus com o usuário recém-criado
    await Museu.updateMany(
      { _id: { $in: museusValidos } },
      { $set: { usuario: novoUsuario._id } }
    )

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
      profile?: Types.ObjectId[] | { $in: Types.ObjectId[] }
    } = {}

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
