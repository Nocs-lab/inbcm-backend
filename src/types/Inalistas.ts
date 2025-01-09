import mongoose from "mongoose"

export interface IAnalista {
  _id: mongoose.Types.ObjectId
  nome: string
  email: string
  especialidadeAnalista: string[]
}
