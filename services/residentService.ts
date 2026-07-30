import { connectDB } from '@/lib/db';
import { Resident, IResidentDocument } from '@/models/Resident';
import { PaginatedResult, PaginationParams } from '@/types';

export class ResidentService {
  static async createResident(data: {
    apartmentId: string;
    flatId: string;
    name: string;
    whatsappNumber: string;
  }) {
    await connectDB();
    // Normalize phone number (strip whitespace and formatting)
    const cleanedPhone = data.whatsappNumber.replace(/[^\d+]/g, '');

    return Resident.create({
      apartmentId: data.apartmentId,
      flatId: data.flatId,
      name: data.name.trim(),
      whatsappNumber: cleanedPhone,
    });
  }

  static async getResidentsByApartment(
    apartmentId: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<IResidentDocument>> {
    await connectDB();
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || 10);
    const skip = (page - 1) * limit;

    const query: any = { apartmentId };
    if (params?.search) {
      query.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { whatsappNumber: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Resident.find(query)
        .populate('flatId', 'flatNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Resident.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getResidentByWhatsApp(whatsappNumber: string) {
    await connectDB();
    const cleaned = whatsappNumber.replace(/[^\d]/g, '');
    // Regex match trailing 10 digits to handle country code variations (+91, 91, etc.)
    const last10Digits = cleaned.slice(-10);
    return Resident.findOne({
      whatsappNumber: { $regex: last10Digits + '$' },
    }).populate('apartmentId flatId');
  }

  static async updateResident(
    id: string,
    data: { name?: string; whatsappNumber?: string; flatId?: string }
  ) {
    await connectDB();
    const updateData: any = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.flatId) updateData.flatId = data.flatId;
    if (data.whatsappNumber) {
      updateData.whatsappNumber = data.whatsappNumber.replace(/[^\d+]/g, '');
    }

    return Resident.findByIdAndUpdate(id, updateData, { new: true }).populate('flatId', 'flatNumber');
  }

  static async deleteResident(id: string) {
    await connectDB();
    return Resident.findByIdAndDelete(id);
  }
}
