import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDeliveryDocument extends Document {
  apartmentId: mongoose.Types.ObjectId;
  flatId: mongoose.Types.ObjectId;
  courier: string;
  trackingNumber?: string;
  status: 'pending' | 'collected';
  deliveredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDeliveryDocument>(
  {
    apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true, index: true },
    flatId: { type: Schema.Types.ObjectId, ref: 'Flat', required: true, index: true },
    courier: { type: String, required: true, trim: true },
    trackingNumber: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['pending', 'collected'], default: 'pending' },
    deliveredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Delivery: Model<IDeliveryDocument> =
  mongoose.models.Delivery || mongoose.model<IDeliveryDocument>('Delivery', DeliverySchema);
