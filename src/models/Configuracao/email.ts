import mongoose from "mongoose"
import ConfiguracaoBaseModel, { type ConfiguracaoBase } from "./"

interface ConfiguracaoEmail extends ConfiguracaoBase {
  key: "email"
  emailHost: string
  emailPort: number
  emailUser: string
  emailPass: string
  emailFrom: string
}

const configuracaoEmailSchema = new mongoose.Schema<ConfiguracaoEmail>({
  key: {
    type: String,
    enum: ["email"],
    default: "email",
    required: true,
    unique: true,
    trim: true
  },

  emailHost: {
    type: String,
    required: true,
    trim: true
  },
  emailPort: {
    type: Number,
    required: true
  },
  emailUser: {
    type: String,
    required: true,
    trim: true
  },
  emailPass: {
    type: String,
    required: true,
    trim: true
  },
  emailFrom: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
})

const ConfiguracaoEmailModel = ConfiguracaoBaseModel.discriminator<ConfiguracaoEmail>(
  "ConfiguracaoEmail",
  configuracaoEmailSchema
)

export default ConfiguracaoEmailModel
