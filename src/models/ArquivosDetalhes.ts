import { Schema, model } from "mongoose";



const ArquivoDetalhesSchema = new Schema({
    declaracaoId: { type: Schema.Types.ObjectId, ref: "Declaracoes", required: true },
    tipo: {
      type: String,
      enum: ["arquivistico", "bibliografico", "museologico"],
      required: true
    },
    detalhesPath: { type: String },
  }, {
    timestamps: true
  });

export const ArquivoDetalhes = model("ArquivoDetalhes", ArquivoDetalhesSchema);
