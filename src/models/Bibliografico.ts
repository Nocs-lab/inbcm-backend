import mongoose from "mongoose"
import Bem from "./BemCultural"
const { bibliografico } = await import("inbcm-xlsx-validator/schema")

const fields: Record<string, unknown> = {}

for (const field of Object.keys(bibliografico.fields)) {
  fields[field] = { type: String }
}

// Modelo específico para documentos bibliográficos
const BibliograficoSchema = new mongoose.Schema(fields)

// Use discriminadores para distinguir os modelos
export const Bibliografico = Bem.discriminator(
  "Bibliografico",
  BibliograficoSchema
)
