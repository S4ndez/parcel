import { connectDB } from '@/lib/db';
import { Flat, IFlatDocument } from '@/models/Flat';
import { PaginatedResult, PaginationParams } from '@/types';

export class FlatService {
  static async createFlat(data: { apartmentId: string; flatNumber: string }) {
    await connectDB();
    const existing = await Flat.findOne({
      apartmentId: data.apartmentId,
      flatNumber: data.flatNumber.toUpperCase().trim(),
    });

    if (existing) {
      throw new Error(`Flat ${data.flatNumber} already exists in this apartment`);
    }

    return Flat.create({
      apartmentId: data.apartmentId,
      flatNumber: data.flatNumber.toUpperCase().trim(),
    });
  }

  static async getFlatsByApartment(
    apartmentId: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<IFlatDocument>> {
    await connectDB();
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || 10);
    const skip = (page - 1) * limit;

    const query: any = { apartmentId };
    if (params?.search) {
      query.flatNumber = { $regex: params.search, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      Flat.find(query).sort({ flatNumber: 1 }).skip(skip).limit(limit),
      Flat.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getAllFlatsByApartment(apartmentId: string) {
    await connectDB();
    return Flat.find({ apartmentId }).sort({ flatNumber: 1 });
  }

  static async updateFlat(id: string, data: { flatNumber: string }) {
    await connectDB();
    return Flat.findByIdAndUpdate(
      id,
      { flatNumber: data.flatNumber.toUpperCase().trim() },
      { new: true }
    );
  }

  static async deleteFlat(id: string) {
    await connectDB();
    return Flat.findByIdAndDelete(id);
  }
}
