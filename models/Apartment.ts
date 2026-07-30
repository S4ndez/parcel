import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApartmentDocument extends Document {
  name: string;
  address: string;
  qrCode?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ApartmentSchema = new Schema<IApartmentDocument>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    qrCode: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const Apartment: Model<IApartmentDocument> =
  mongoose.models.Apartment || mongoose.model<IApartmentDocument>('Apartment', ApartmentSchema);
