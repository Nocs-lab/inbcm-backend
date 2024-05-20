import mongoose, { Schema, Document, Types } from 'mongoose';

interface IMuseu extends Document {
  nome: string;
  endereco: {
    cidade: string;
    rua: string;
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

const Museu = mongoose.model<IMuseu>('museus', MuseuSchema);

export default Museu;
