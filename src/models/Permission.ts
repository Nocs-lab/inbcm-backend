import mongoose, { Schema, Document, Types } from 'mongoose';


interface IPermission extends Document {
  name: string;
}

const PermissionSchema: Schema = new Schema({
  name: { type: String, required: true }
});


export const Permission = mongoose.model<IPermission>('permissions', PermissionSchema);
