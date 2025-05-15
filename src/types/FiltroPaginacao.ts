
import { z } from "zod"

export const filtroSchema = z.object({
  atributo: z.string(),
  operador: z.enum(["eq", "ne", "in", "like", "gte", "lte"]),
  tipo: z.enum(["string", "number", "date"]),
  valores: z.array(z.string()).min(1),
  ordem: z.enum(["asc", "desc"]).optional()
})

export const filtroPaginacaoSchema = z.object({
  pagina: z.number().int().min(1),
  tamanho: z.number().int().min(1),
  colunas: z.array(z.string()).optional(),
  tipoArquivo: z.enum(["museologico", "arquivistico", "bibliografico"]),
  filtros: z.array(filtroSchema).nonempty()
})

export type Filtro = z.infer<typeof filtroSchema>
export type FiltroPaginacao = z.infer<typeof filtroPaginacaoSchema>
