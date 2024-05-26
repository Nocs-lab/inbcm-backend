import mongoose, { Schema, Document, Types } from 'mongoose';

interface IMuseu extends Document {
  codIbram: string;
  nome: string;
  esferaAdministraiva: string;
  endereco: {
    cidade: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cep: string;
    municipio: string;
    uf: string;
  };
  usuario: Types.ObjectId;
}
const MuseuSchema: Schema = new Schema({
  codIbram: { type: String, required: true },
  nome: { type: String, required: true },
  esferaAdministraiva:{ type: String, required: true },
  endereco: {
    cidade: { type: String, required: true },
    logradouro: { type: String, required: true },
    numero:{ type: String, required: true },
    complemento:{type: String, required: false},
    bairro:{type: String, required: true},
    cep:{type: String, required: true},
    municipio:{type: String, required: true},
    uf:{type: String, required: true},
  },
  usuario: { type: Schema.Types.ObjectId, requied: true, ref: "usuarios" }
});

const Museu = mongoose.model<IMuseu>('museus', MuseuSchema);

export default Museu;
