import mongoose, { Schema, Document, Types } from 'mongoose';

interface IMuseu extends Document {
  nome: string;
  endereco: {
    cidade: string;
    rua: string;
    UF: { type: string, enum: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'] };
  };
  usuario: Types.ObjectId
}

const MuseuSchema: Schema = new Schema({
  nome: { type: String, required: true },
  endereco: {
    cidade: { type: String, required: true },
    rua: { type: String, required: true }
  },
  usuario: { type: Schema.Types.ObjectId, requied: true, ref: "usuarios" }
});

export const Museu = mongoose.model<IMuseu>('museus', MuseuSchema);
