import mongoose from "mongoose"
import Bem from "./BemCultural"
const { arquivistico } = await import("inbcm-xlsx-validator/schema")

const fields: Record<string, unknown> = {}

for (const field of Object.keys(arquivistico.fields)) {
  fields[field] = { type: String }
}

// Modelo específico para documentos arquivísticos
const ArquivisticoSchema = new mongoose.Schema(fields)

// Use discriminadores para distinguir os modelos
export const Arquivistico = Bem.discriminator(
  "Arquivistico",
  ArquivisticoSchema
)
