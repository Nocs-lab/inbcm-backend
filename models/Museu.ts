import mongoose, { Schema, Document } from 'mongoose';

interface IMuseu extends Document {
  nome: string;
  endereco: {
    cidade: string;
    rua: string;
  };
}

const MuseuSchema: Schema = new Schema({
  nome: { type: String, required: true },
  endereco: {
    cidade: { type: String, required: true },
    rua: { type: String, required: true }
  }
});

const Museu = mongoose.model<IMuseu>('museus', MuseuSchema);

export default Museu;
