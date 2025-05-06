import { Schema, model, Types } from "mongoose"

const ImportacaoSchema = new Schema({
  museu: { type: Types.ObjectId, ref: "Museu", required: true },
  data: { type: Date, default: Date.now },
  arquivo: { type: String } 
})

export default model("Importacao", ImportacaoSchema)
