import mongoose, { Schema, Document } from "mongoose"

export interface Config extends Document {
  emailHost: string
  emailPort: number
  emailUser: string
  emailPass: string
  emailFrom: string
}

const ConfigSchema = new Schema<Config>(
  {
    emailHost: { type: String, required: true },
    emailPort: { type: Number, required: true },
    emailUser: { type: String, required: true },
    emailPass: { type: String, required: true },
    emailFrom: { type: String, required: true }
  },
  { timestamps: true, versionKey: false }
)

export const Config = mongoose.model<Config>("Config", ConfigSchema)
