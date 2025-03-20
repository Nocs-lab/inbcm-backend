import mongoose, { Schema, Document, Types } from "mongoose"

export interface IMuseu extends Document {
  codIbram: string
  nome: string
  esferaAdministraiva: string
  endereco: {
    cidade: string
    UF: {
      type: string
      enum: [
        "AC",
        "AL",
        "AP",
        "AM",
        "BA",
        "CE",
        "DF",
        "ES",
        "GO",
        "MA",
        "MT",
        "MS",
        "MG",
        "PA",
        "PB",
        "PR",
        "PE",
        "PI",
        "RJ",
        "RN",
        "RS",
        "RO",
        "RR",
        "SC",
        "SP",
        "SE",
        "TO"
      ]
    }
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cep: string
    municipio: string
    uf: string
  }
  usuarios: Types.ObjectId[]
}
const MuseuSchema: Schema = new Schema({
  codIbram: { type: String, required: true },
  nome: { type: String, required: true },
  esferaAdministraiva: { type: String, required: true },
  endereco: {
    logradouro: { type: String, required: true },
    numero: { type: String, required: true },
    complemento: { type: String, required: false },
    bairro: { type: String, required: true },
    cep: { type: String, required: true },
    municipio: { type: String, required: true },
    uf: { type: String, required: true }
  },
  usuarios: [
    {
      type: Schema.Types.ObjectId,
      ref: "usuarios",
      required: false
    }
  ]
})
MuseuSchema.index({ nome: "text" })
export const Museu = mongoose.model<IMuseu>("museus", MuseuSchema)
