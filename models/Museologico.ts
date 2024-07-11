import mongoose from "mongoose";
import Bem from "./BemCultural";
import { museologico } from "inbcm-xlsx-validator/schema.ts";

const fields: Record<string, unknown> = {}

for (const field of Object.keys(museologico.fields)) {
  fields[field] = { type: String, maxlength: 1024 }
}

// Modelo específico para documentos museológicos
const MuseologicoSchema = new mongoose.Schema(fields);

export const Museologico = Bem.discriminator("Museologico", MuseologicoSchema);

