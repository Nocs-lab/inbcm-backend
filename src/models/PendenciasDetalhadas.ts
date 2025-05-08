import { Schema, model, Types } from "mongoose";

const PendenciaDetalhadaSchema = new Schema(
  {
    declaracaoId: { type: Types.ObjectId, ref: "Declaracoes", required: true },
    tipoArquivo: {
      type: String,
      enum: ["museologico", "arquivistico", "bibliografico"],
      required: true
    },
    chunkIndex: { type: Number, required: true },
    erros: [
      {
        linha: { type: Number, required: true },
        camposComErro: {
          type: Map,
          of: String,
          required: true
        }
      }
    ]
  },
  { timestamps: true }
);

export const PendenciaDetalhadaModel = model(
  "PendenciasDetalhadas",
  PendenciaDetalhadaSchema
);
