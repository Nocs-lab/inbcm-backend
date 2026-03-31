import { z } from "zod"

export const uploadDeclaracaoSchema = z.object({}).passthrough()

export const retificarDeclaracaoSchema = z.object({}).passthrough()

export const enviarParaAnaliseSchema = z.object({
  arquivistico: z.array(z.string()).optional(),
  bibliografico: z.array(z.string()).optional(),
  museologico: z.array(z.string()).optional()
})

export const atualizarStatusBensSchema = z.object({
  arquivistico: z
    .object({
      status: z.string(),
      comentario: z.string().optional()
    })
    .optional(),
  bibliografico: z
    .object({
      status: z.string(),
      comentario: z.string().optional()
    })
    .optional(),
  museologico: z
    .object({
      status: z.string(),
      comentario: z.string().optional()
    })
    .optional()
})
