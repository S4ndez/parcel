import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFlatDocument extends Document {
  apartmentId: mongoose.Types.ObjectId;
  flatNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const FlatSchema = new Schema<IFlatDocument>(
  {
    apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true, index: true },
    flatNumber: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Index to prevent duplicate flat numbers in the same apartment
FlatSchema.index({ apartmentId: 1, flatNumber: 1 }, { unique: true });

export const Flat: Model<IFlatDocument> =
  mongoose.models.Flat || mongoose.model<IFlatDocument>('Flat', FlatSchema);
