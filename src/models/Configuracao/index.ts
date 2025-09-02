import mongoose from "mongoose"

export interface ConfiguracaoBase extends mongoose.Document {
  key: string;
}

const ConfiguracaoBaseSchema = new mongoose.Schema<ConfiguracaoBase>({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

const ConfiguracaoBaseModel = mongoose.model<ConfiguracaoBase>("Configuracoes", ConfiguracaoBaseSchema);

export default ConfiguracaoBaseModel;
