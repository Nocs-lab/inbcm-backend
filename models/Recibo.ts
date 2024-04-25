import mongoose, { Schema, Document } from "mongoose";

export interface Recibo extends Document {
  dataHoraEnvio: Date;
  numeroIdentificacao: string;
  confirmacaoRecebimento: boolean;
}

const ReciboSchema = new Schema({
  dataHoraEnvio: {
    type: Date,
    required: true,
    default: Date.now // Definindo o valor padrão como a data/hora atual
  },
  numeroIdentificacao: {
    type: String,
    required: true,
    unique: true // Garantindo que seja único
  },
  confirmacaoRecebimento: {
    type: Boolean,
    default: false // Iniciando como falso por padrão
  },
});

export const ReciboModel = mongoose.model<Recibo>("Recibo", ReciboSchema);
