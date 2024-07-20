import mongoose, { Schema, Document, Types } from 'mongoose';

interface IProfile extends Document {
  name: string;
  description?: string;
  permissions: Types.ObjectId[];
  isProtected: boolean;
}

const ProfileSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true, maxlength: 60 },
  description: { type: String, maxlength: 120 },
  permissions: [{ type: Schema.Types.ObjectId, ref: 'permissions' }],
  isProtected: { type: Boolean, default: false, select: false  }
}, { timestamps: true });

export const Profile = mongoose.model<IProfile>('profiles', ProfileSchema);
