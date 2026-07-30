import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '@/types';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  apartmentId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'apartment_manager'], required: true },
    apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', default: null },
  },
  { timestamps: true }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
