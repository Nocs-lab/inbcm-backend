import mongoose, { Schema, Document, Types } from 'mongoose';

interface IProfile extends Document {
  name: string;
  description?: string;
  permissions: Types.ObjectId[];
}

const ProfileSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  permissions: [{ type: Schema.Types.ObjectId, ref: 'permissions' }]
});

export const Profile = mongoose.model<IProfile>('profiles', ProfileSchema);
