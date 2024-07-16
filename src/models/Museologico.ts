import mongoose from "mongoose"
import Bem from "./BemCultural"
const { museologico } = await import("inbcm-xlsx-validator/schema")

const fields: Record<string, unknown> = {}

for (const field of Object.keys(museologico.fields)) {
  fields[field] = { type: String }
}

// Modelo específico para documentos museológicos
const MuseologicoSchema = new mongoose.Schema(fields)

export const Museologico = Bem.discriminator("Museologico", MuseologicoSchema)
