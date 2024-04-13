import mongoose from 'mongoose';
import Bem from './BemCultural.js';

// Modelo específico para documentos bibliográficos
const BibliograficoSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  editora: { type: String, required: true },
  dimensaoFisica: { type: String, required: true },
  encadernacao: { type: String },
  identificacaoResponsabilidade: { type: String, required: true },
  assuntoPrincipal: { type: String, required: true },
  assuntoCronologico: { type: String },
  assuntoGeografico: { type: String },
});

// Use discriminadores para distinguir os modelos
const Bibliografico = Bem.discriminator('Bibliografico', BibliograficoSchema);

export default Bibliografico;
