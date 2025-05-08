import { Types } from "mongoose"
import { PendenciaDetalhadaModel } from "../models/PendenciasDetalhadas" 


export interface ErroDetalhado {
  linha: number
  camposComErro: Record<string, string>
}


interface Params {
  declaracaoId: Types.ObjectId
  tipoArquivo: "arquivistico" | "bibliografico" | "museologico"
  erros: ErroDetalhado[]
}


function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}


export async function salvarPendenciasEmChunks({
  declaracaoId,
  tipoArquivo,
  erros
}: Params) {
  const chunks = chunkArray(erros, 1000)

  for (let i = 0; i < chunks.length; i++) {
    await PendenciaDetalhadaModel.create({
      declaracaoId,
      tipoArquivo,
      chunkIndex: i,
      erros: chunks[i]
    })
  }
}
