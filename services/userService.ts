import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { signJWT } from '@/lib/jwt';
import { JWTPayload, UserRole } from '@/types';

export class UserService {
  static async authenticateUser(email: string, password?: string): Promise<{ token: string; user: JWTPayload } | null> {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.password) return null;

    const isMatch = verifyPassword(password || '', user.password);
    if (!isMatch) return null;

    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      apartmentId: user.apartmentId ? user.apartmentId.toString() : undefined,
      name: user.name,
    };

    const token = signJWT(payload);
    return { token, user: payload };
  }

  static async createUser(data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    apartmentId?: string;
  }) {
    await connectDB();

    const existingUser = await User.findOne({ email: data.email.toLowerCase().trim() });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const defaultPassword = data.password || 'ParcelFlow@123';
    const hashedPassword = hashPassword(defaultPassword);

    const newUser = await User.create({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      role: data.role,
      apartmentId: (data.apartmentId || undefined) as any,
    });

    return newUser;
  }

  static async getManagers(apartmentId?: string) {
    await connectDB();
    const query: any = { role: 'apartment_manager' };
    if (apartmentId) {
      query.apartmentId = apartmentId;
    }
    return User.find(query).populate('apartmentId', 'name address').sort({ createdAt: -1 });
  }

  static async getUserById(userId: string) {
    await connectDB();
    return User.findById(userId).populate('apartmentId', 'name address').select('-password');
  }

  static async updateUser(userId: string, data: { name?: string; email?: string; password?: string; apartmentId?: string }) {
    await connectDB();
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email.toLowerCase().trim();
    if (data.apartmentId !== undefined) updateData.apartmentId = data.apartmentId || null;
    if (data.password) {
      updateData.password = hashPassword(data.password);
    }

    return User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
  }

  static async deleteUser(userId: string) {
    await connectDB();
    return User.findByIdAndDelete(userId);
  }

  static async seedInitialAdmin() {
    await connectDB();
    const adminCount = await User.countDocuments({ role: 'super_admin' });
    if (adminCount === 0) {
      await this.createUser({
        name: 'Super Admin',
        email: 'admin@parcelflow.com',
        password: 'AdminPassword123!',
        role: 'super_admin',
      });
      return { seeded: true, message: 'Super admin created: admin@parcelflow.com / AdminPassword123!' };
    }
    return { seeded: false, message: 'Super admin already exists' };
  }
}
