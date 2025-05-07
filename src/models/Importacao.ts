import { Schema, model, Document, Types } from "mongoose";

export interface Importacao extends Document {
  status: "pendente" | "em_andamento" | "concluida" | "erro";
  iniciadoEm: Date;
  finalizadoEm?: Date;
  erro?: string;
  museusCadastrados?: number;
  usuario?: Types.ObjectId;
  numeroImportados?: number;
  totalImportacoesConcluidas?: number; 
}

const ImportacaoSchema = new Schema<Importacao>({
  status: { type: String, enum: ["pendente", "em_andamento", "concluida", "erro"], required: true },
  iniciadoEm: { type: Date, required: true },
  finalizadoEm: { type: Date },
  erro: { type: String },
  museusCadastrados: { type: Number},
  numeroImportados: { type: Number},
  totalImportacoesConcluidas: { type: Number, default: 0 },
   usuario: 
      {
        type: Schema.Types.ObjectId,
        ref: "usuarios",
        required: false
      }
    
});

export default model<Importacao>("Importacoe", ImportacaoSchema);
