import { z } from "zod"

export const registerExternalDeclarantSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("E-mail inválido."),
  cpf: z.string().min(11, "CPF inválido."),
  senha: z.string().min(4, "Senha obrigatória."),
  museus: z.union([z.string(), z.array(z.string())]).optional()
})

export const registerExternalAnalystSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("E-mail inválido."),
  cpf: z.string().min(11, "CPF inválido."),
  senha: z.string().min(4, "Senha obrigatória."),
  especialidadeAnalista: z
    .array(z.enum(["museologico", "arquivistico", "bibliografico"]))
    .optional()
})

export const registerUserSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("E-mail inválido."),
  senha: z.string().min(4, "Senha obrigatória."),
  cpf: z.string().min(11, "CPF inválido."),
  profile: z.string().min(1, "Perfil é obrigatório."),
  especialidadeAnalista: z
    .array(z.enum(["museologico", "arquivistico", "bibliografico"]))
    .optional(),
  museus: z.array(z.string()).optional()
})

export const atualizarUsuarioSchema = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email().optional(),
  cpf: z.string().min(11).optional(),
  perfil: z.string().optional(),
  especialidadeAnalista: z
    .array(z.enum(["museologico", "arquivistico", "bibliografico"]))
    .optional(),
  museus: z.array(z.string()).optional(),
  desvincularMuseus: z.array(z.string()).optional(),
  situacao: z.number().optional(),
  senha: z.string().min(4).optional()
})

export const atualizarPerfilUsuarioSchema = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(4).optional()
})

export const recuperarSenhaSchema = z.object({
  email: z.string().email("E-mail inválido.")
})

export const redefinirSenhaSchema = z.object({
  token: z.string().min(1, "Token é obrigatório."),
  senha: z.string().min(4, "Senha obrigatória.")
})
