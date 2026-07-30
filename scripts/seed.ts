import mongoose from 'mongoose';
import crypto from 'crypto';

// MongoDB Atlas URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sandeshgirish_db_user:sn2wERG3TNKXrCaI@cluster0.rtepagl.mongodb.net/parcelflow?retryWrites=true&w=majority';

// Password Hashing Utility
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// User Mongoose Schema
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'apartment_manager'], required: true },
    apartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', default: null },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedSuperAdmin() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database successfully.');

    const adminEmail = 'admin@parcelflow.com';
    const adminPassword = 'AdminPassword123!';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`\nSuper Admin already exists in database.`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Role: ${existingAdmin.role}`);
    } else {
      const hashedPassword = hashPassword(adminPassword);

      const superAdmin = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'super_admin',
        apartmentId: null,
      });

      console.log('\n=============================================');
      console.log('🎉 SUPER ADMIN ACCOUNT CREATED SUCCESSFULLY!');
      console.log('=============================================');
      console.log(`ID:       ${superAdmin._id}`);
      console.log(`Name:     ${superAdmin.name}`);
      console.log(`Email:    ${superAdmin.email}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`Role:     ${superAdmin.role}`);
      console.log('=============================================\n');
    }
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

seedSuperAdmin();
