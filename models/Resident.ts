import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResidentDocument extends Document {
  apartmentId: mongoose.Types.ObjectId;
  flatId: mongoose.Types.ObjectId;
  name: string;
  whatsappNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResidentSchema = new Schema<IResidentDocument>(
  {
    apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true, index: true },
    flatId: { type: Schema.Types.ObjectId, ref: 'Flat', required: true, index: true },
    name: { type: String, required: true, trim: true },
    whatsappNumber: { type: String, required: true, trim: true, index: true },
  },
  { timestamps: true }
);

export const Resident: Model<IResidentDocument> =
  mongoose.models.Resident || mongoose.model<IResidentDocument>('Resident', ResidentSchema);
