import mongoose from "mongoose"
import Bem from "./BemCultural"
import { museologico } from "../xlsx_validator/schema"

const fields: Record<string, unknown> = {}

for (const field of Object.keys(museologico.fields)) {
  fields[field] = { type: String }
}

// Modelo específico para documentos museológicos
const MuseologicoSchema = new mongoose.Schema(fields)

export const Museologico = Bem.discriminator("Museologico", MuseologicoSchema)
