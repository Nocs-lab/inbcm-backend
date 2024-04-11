const mongoose = require('mongoose');
const Bem = require('./BemCultural.js');

// Modelo específico para documentos museológicos
const MuseologicoSchema = new mongoose.Schema({
  autor: { type: String, required: true },
  classificacao: { type: String },
  denominacao: { type: String, required: true },
  dimensoes: { type: String, required: true },
  dataProducao: { type: String },
});

// Use discriminadores para distinguir os modelos
module.exports = Bem.discriminator('Museologico', MuseologicoSchema);
