import { connectDB } from '@/lib/db';
import { Apartment, IApartmentDocument } from '@/models/Apartment';
import { generateApartmentQRCode } from '@/lib/qr';
import { PaginatedResult, PaginationParams } from '@/types';

export class ApartmentService {
  static async createApartment(data: { name: string; address: string; status?: 'active' | 'inactive' }) {
    await connectDB();
    const apartment = await Apartment.create({
      name: data.name,
      address: data.address,
      status: data.status || 'active',
    });

    // Generate public QR Code URL payload
    const qrCodeData = await generateApartmentQRCode(apartment._id.toString());
    apartment.qrCode = qrCodeData;
    await apartment.save();

    return apartment;
  }

  static async getApartments(params: PaginationParams): Promise<PaginatedResult<IApartmentDocument>> {
    await connectDB();
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 10);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (params.search) {
      query.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { address: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Apartment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Apartment.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getApartmentById(id: string) {
    await connectDB();
    return Apartment.findById(id);
  }

  static async updateApartment(id: string, data: { name?: string; address?: string; status?: 'active' | 'inactive' }) {
    await connectDB();
    return Apartment.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteApartment(id: string) {
    await connectDB();
    return Apartment.findByIdAndDelete(id);
  }

  static async regenerateQRCode(id: string) {
    await connectDB();
    const qrCodeData = await generateApartmentQRCode(id);
    return Apartment.findByIdAndUpdate(id, { qrCode: qrCodeData }, { new: true });
  }
}
