import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://sandeshgirish_db_user:sn2wERG3TNKXrCaI@cluster0.rtepagl.mongodb.net/parcelflow?retryWrites=true&w=majority';

const ApartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    qrCode: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

const Apartment = mongoose.models.Apartment || mongoose.model('Apartment', ApartmentSchema);

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    const count = await Apartment.countDocuments({});
    console.log('Apartments count:', count);
    const list = await Apartment.find({});
    console.log('Apartments list:', list);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
