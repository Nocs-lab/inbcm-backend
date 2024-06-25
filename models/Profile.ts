import mongoose, { Schema, Document, Types } from 'mongoose';


interface IProfile extends Document {
  name: string;
  permissions: string[];
}

const ProfileSchema: Schema = new Schema({
  name: { type: String, required: true },
  permissions: [],
});


export const Profile = mongoose.model<IProfile>('profiles', ProfileSchema);
