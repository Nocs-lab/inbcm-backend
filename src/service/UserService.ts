import argon2 from "@node-rs/argon2"
import { SituacaoUsuario, Usuario } from "../models/Usuario"
import { IProfile, Profile } from "../models/Profile"
import mongoose, { Types } from "mongoose"
import { Declaracoes, IMuseu, Museu } from "../models"
import HTTPError from "../utils/error"
import { z } from "zod"
import { sendEmail } from "../emails"
import minioClient from "../db/minioClient"
import { randomUUID } from "crypto"
import { DataUtils } from "../utils/dataUtils"
import config from "../config"
import { Status } from "../enums/Status"

const usuarioExternoSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("E-mail inválido."),
  profile: z.string().min(1, "O perfil é obrigatório."),
  cpf: z.string().min(11, "CPF inválido."),
  senha: z.string().min(4, "Senha obrigatória.")
})

export class UsuarioService {

  static async criarUsuarioExternoDeclarant({
    nome,
    email,
    profile,
    cpf,
    museus,
    senha,
    arquivo
  }: {
    nome: string
    email: string
    profile: string
    cpf: string
    museus: string[]
    senha: string
    arquivo: Express.Multer.File
  }) {
    // Valida perfil
    const perfil = await Profile.findOne({ name: profile })
    if (!perfil) {
      throw new HTTPError("Tipo de perfil de usuário não encontrado.", 404)
    }
  
    // Upload do arquivo para o Minio
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
  
    // Criação do usuário
    const senhaHash = await argon2.hash(senha)
    const novoUsuario = new Usuario({
      nome,
      email,
      cpf,
      senha: senhaHash,
      profile: perfil._id,
      situacao: SituacaoUsuario.ParaAprovar,
      documentoComprobatorio
    })
  
    await novoUsuario.save()
  
    const usuarioId = (novoUsuario._id as Types.ObjectId).toString()
    await this.vincularMuseusAoUsuario(usuarioId, museus)
  
    // Envio de e-mail para o usuário solicitante
    await sendEmail("solicitar-acesso", email, { name: nome })
  
    // Envio de e-mail para os administradores informando novo usuário solicitando acesso
    const usuarios = await Usuario.find({ ativo: true }).populate<{
      profile: IProfile
    }>("profile")
    const emails = usuarios
      .filter((usuario) => usuario.profile?.name === "admin")
      .map((usuario) => usuario.email)
  
    const urlGestaoUsuario = `${config.ADMIN_SITE_URL}/usuarios`
    const horario = `${DataUtils.gerarDataFormatada()} às ${DataUtils.gerarHoraFormatada()}`
    await sendEmail("novo-usuario-admin", emails, {
      nome,
      email,
      horario,
      url: urlGestaoUsuario
    })
  
    return novoUsuario
  }
  

  static async validarUsuarioExternoDeclarant({
    nome,
    email,
    profile,
    cpf,
    senha
  }: {
    nome: string
    email: string
    profile: string
    cpf: string
    senha: string
  }) {
    const resultadoValidacao = usuarioExternoSchema.safeParse({
      nome,
      email,
      profile,
      cpf,
      senha
    })
    if (!resultadoValidacao.success) {
      throw new HTTPError(resultadoValidacao.error.errors[0].message, 422)
    }
    let usuarioExistente = await Usuario.findOne({ email })
    if (usuarioExistente) {
      if (usuarioExistente.situacao === SituacaoUsuario.ParaAprovar) {
        throw new HTTPError(
          "Uma solicitação de acesso para o email informado já foi registrada e está em análise.",
          422
        )
      }
      throw new HTTPError("E-mail já cadastrado no sistema.", 400)
    }

    usuarioExistente = await Usuario.findOne({ cpf })
    if (usuarioExistente) {
      if (usuarioExistente.situacao === SituacaoUsuario.ParaAprovar) {
        throw new HTTPError(
          "Uma solicitação de acesso para o CPF informado já foi registrada e está em análise.",
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
        "Cadastro externo apenas para perfil declarante.",
        422
      )
    }
  }

  static async criarUsuarioExternoAnalyst({
    nome,
    email,
    profile,
    cpf,
    senha,
    arquivo,
    especialidadeAnalista,
  }: {
    nome: string
    email: string
    profile: string
    cpf: string
    senha: string
    arquivo: Express.Multer.File
    especialidadeAnalista?: string[]
  }) {

    const perfil = await Profile.findOne({ name: profile })
    if (!perfil) {
      throw new HTTPError("Tipo de perfil de usuário não encontrado.", 404)
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

    const senhaHash = await argon2.hash(senha)
    const novoUsuario = new Usuario({
      nome,
      email,
      cpf,
      senha: senhaHash,
      profile: perfil._id,
      situacao: SituacaoUsuario.ParaAprovar,
      especialidadeAnalista,
      documentoComprobatorio
    })

    await novoUsuario.save()

    // Envio e-mail para o usuário solicitante
    await sendEmail("solicitar-acesso", email, { name: nome })

    // Envio de e-mail para os administradores informando novo usuário solicitando acesso
    const usuarios = await Usuario.find({ ativo: true }).populate<{
      profile: IProfile
    }>("profile")
    const emails = usuarios
      .filter((usuario) => usuario.profile?.name === "admin")
      .map((usuario) => usuario.email)
    const urlGestaoUsuario = `${config.ADMIN_SITE_URL}/usuarios`
    const horario = `${DataUtils.gerarDataFormatada()} às ${DataUtils.gerarHoraFormatada()}`
    await sendEmail("novo-usuario-admin", emails, {
      nome,
      email,
      horario,
      url: urlGestaoUsuario
    })

    return novoUsuario
  }

  static async validarUsuarioExternoAnalyst({
    nome,
    email,
    profile,
    cpf,
    senha,
    especialidadeAnalista
  }: {
    nome: string
    email: string
    profile: string
    cpf: string
    senha: string
    especialidadeAnalista: string[]
  }) {
    const resultadoValidacao = usuarioExternoSchema.safeParse({
      nome,
      email,
      profile,
      cpf,
      senha
    })
    if (!resultadoValidacao.success) {
      throw new HTTPError(resultadoValidacao.error.errors[0].message, 422)
    }
    let usuarioExistente = await Usuario.findOne({ email })
    if (usuarioExistente) {
      if (usuarioExistente.situacao === SituacaoUsuario.ParaAprovar) {
        throw new HTTPError(
          "Uma solicitação de acesso para o email informado já foi registrada e está em análise.",
          422
        )
      }
      throw new HTTPError("E-mail já cadastrado no sistema.", 400)
    }

    usuarioExistente = await Usuario.findOne({ cpf })
    if (usuarioExistente) {
      if (usuarioExistente.situacao === SituacaoUsuario.ParaAprovar) {
        throw new HTTPError(
          "Uma solicitação de acesso para o CPF informado já foi registrada e está em análise.",
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
    if (perfilExistente.name !== "analyst") {
      throw new HTTPError(
        "Cadastro externo apenas para perfil analista.",
        422
      )
    }
  }



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
  static async criarUsuario({ nome, email, senha, cpf, profile, especialidadeAnalista, museus }: {
    nome: string
    email: string
    senha: string
    cpf: string
    profile: string
    especialidadeAnalista?: string[]
    museus: string[]
  }) {
    try {
      const senhaHash = await argon2.hash(senha)
  
      const novoUsuario = new Usuario({
        nome,
        email,
        senha: senhaHash,
        profile,
        cpf,
        situacao: SituacaoUsuario.Ativo,
        especialidadeAnalista,
        museus: []
      })
  
      await novoUsuario.save()
  
      const usuarioId = (novoUsuario._id as Types.ObjectId).toString()
      await UsuarioService.vincularMuseusAoUsuario(usuarioId, museus)
      
  
      return novoUsuario
    } catch (error) {
      throw error
    }
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

  static async vincularMuseusAoUsuario(usuarioId: string, museuIds: string[]) {
    const usuario = await Usuario.findById(usuarioId)
    if (!usuario) {
      throw new HTTPError("Usuário não encontrado.", 404)
    }

    for (const museuId of museuIds) {
      if (!Types.ObjectId.isValid(museuId)) continue

      const museu = await Museu.findById(museuId)
      if (!museu) continue

      const userObjectId = new Types.ObjectId(usuarioId)

      if (!museu.usuario.some((u) => u.equals(userObjectId))) {
        museu.usuario.push(userObjectId)
        await museu.save()
      }

      if (!usuario.museus.some((m) => m.equals(museuId))) {
        usuario.museus.push(museuId)
      }
    }

    await usuario.save()
    return usuario
  }

  static async desvincularMuseusDoUsuario(usuarioId: string, museuIds: string[]) {
    const usuario = await Usuario.findById(usuarioId)
    if (!usuario) {
      throw new HTTPError("Usuário não encontrado.", 404)
    }
  
    const userObjectId = new Types.ObjectId(usuarioId)
  
    for (const museuId of museuIds) {
      if (!Types.ObjectId.isValid(museuId)) continue
  
      const museu = await Museu.findById(museuId)
      if (!museu) continue
  
    
      const declaracoesComUsuario = await Declaracoes.find({
        museu_id: museu._id,
        status: { $in: [Status.Recebida, Status.EmAnalise] },
        $or: [
          { responsavelEnvio: userObjectId },
          { "museologico.usuario": userObjectId },
          { "arquivistico.usuario": userObjectId },
          { "bibliografico.usuario": userObjectId }
        ]
      })
  
      if (declaracoesComUsuario.length > 0) {
        throw new HTTPError(
          `Não é possível desvincular o usuário do museu ${museu.nome} pois há declarações em análise associadas a ele.`,
          400
        )
      }
  
    
      if (Array.isArray(museu.usuario)) {
        museu.usuario = museu.usuario.filter((id) => !id.equals(userObjectId))
        await museu.save()
      }
  
    
      const museuObjectId = new Types.ObjectId(museuId)
      usuario.museus = usuario.museus.filter(
        (id) => id.toString() !== museuObjectId.toString()
      )
    }
  
    await usuario.save()
    return usuario
  }
  
  
}
