import { connectDB } from '@/lib/db';
import { Delivery, IDeliveryDocument } from '@/models/Delivery';
import { PaginatedResult, PaginationParams } from '@/types';

export class DeliveryService {
  static async createDelivery(data: {
    apartmentId: string;
    flatId: string;
    courier: string;
    trackingNumber?: string;
  }) {
    await connectDB();
    return Delivery.create({
      apartmentId: data.apartmentId,
      flatId: data.flatId,
      courier: data.courier.trim(),
      trackingNumber: data.trackingNumber ? data.trackingNumber.trim() : '',
      status: 'pending',
      deliveredAt: new Date(),
    });
  }

  static async getDeliveriesByApartment(
    apartmentId: string,
    params?: PaginationParams & { status?: string }
  ): Promise<PaginatedResult<IDeliveryDocument>> {
    await connectDB();
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || 10);
    const skip = (page - 1) * limit;

    const query: any = { apartmentId };
    if (params?.status) {
      query.status = params.status;
    }

    if (params?.search) {
      query.$or = [
        { courier: { $regex: params.search, $options: 'i' } },
        { trackingNumber: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Delivery.find(query)
        .populate('flatId', 'flatNumber')
        .sort({ deliveredAt: -1 })
        .skip(skip)
        .limit(limit),
      Delivery.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getPendingDeliveriesForFlat(flatId: string) {
    await connectDB();
    return Delivery.find({ flatId, status: 'pending' })
      .sort({ deliveredAt: -1 })
      .lean();
  }

  static async markCollected(deliveryId: string) {
    await connectDB();
    return Delivery.findByIdAndUpdate(deliveryId, { status: 'collected' }, { new: true });
  }

  static async deleteDelivery(deliveryId: string) {
    await connectDB();
    return Delivery.findByIdAndDelete(deliveryId);
  }
}
