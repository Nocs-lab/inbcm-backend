import mongoose from "mongoose"
import ConfiguracaoBaseModel, { type ConfiguracaoBase } from "./"

interface ConfiguracaoPortalPublico extends ConfiguracaoBase {
  key: "portalPublico"
  url: string
  node_de_usuario: string
  senha: string
}

const configuracaoPortalPublicoSchema =
  new mongoose.Schema<ConfiguracaoPortalPublico>(
    {
      key: {
        type: String,
        enum: ["portalPublico"],
        default: "portalPublico",
        required: true,
        unique: true,
        trim: true
      },
      url: {
        type: String,
        required: true,
        trim: true
      },
      node_de_usuario: {
        type: String,
        required: true,
        trim: true
      },
      senha: {
        type: String,
        required: true,
        trim: true
      }
    },
    {
      timestamps: true,
      versionKey: false
    }
  )

const ConfiguracaoPortalPublicoModel =
  ConfiguracaoBaseModel.discriminator<ConfiguracaoPortalPublico>(
    "ConfiguracaoPortalPublico",
    configuracaoPortalPublicoSchema
  )

export default ConfiguracaoPortalPublicoModel
