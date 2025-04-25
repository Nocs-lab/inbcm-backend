import { Auditoria } from "../models/Auditoria"
import logger from "./logger"

export async function registrarAuditoria({
  documento,
  documentoId,
  acao,
  usuario,
  valorAnterior,
  valorNovo,
}: {
  documento?: string
  documentoId?: string
  acao: "CREATE" | "UPDATE" | "DELETE"
  usuario: string
  valorAnterior?: any
  valorNovo?: any,
}) {
  try {
    await Auditoria.create({
      documento,
      documentoId,
      acao,
      usuario,
      valorAnterior,
      valorNovo,
    })
  } catch (error) {
    logger.warn("Erro ao registrar auditoria:", error)
  }
}
