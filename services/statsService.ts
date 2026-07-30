import { connectDB } from '@/lib/db';
import { Apartment } from '@/models/Apartment';
import { Flat } from '@/models/Flat';
import { Resident } from '@/models/Resident';
import { Delivery } from '@/models/Delivery';
import { User } from '@/models/User';

export class StatsService {
  static async getSuperAdminStats() {
    await connectDB();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalApartments, totalFlats, totalManagers, todayDeliveries, totalDeliveries] =
      await Promise.all([
        Apartment.countDocuments(),
        Flat.countDocuments(),
        User.countDocuments({ role: 'apartment_manager' }),
        Delivery.countDocuments({ deliveredAt: { $gte: todayStart } }),
        Delivery.countDocuments(),
      ]);

    return {
      totalApartments,
      totalFlats,
      totalManagers,
      todayDeliveries,
      totalDeliveries,
    };
  }

  static async getManagerStats(apartmentId: string) {
    await connectDB();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalFlats, totalResidents, todayDeliveries, pendingDeliveries, totalDeliveries] =
      await Promise.all([
        Flat.countDocuments({ apartmentId }),
        Resident.countDocuments({ apartmentId }),
        Delivery.countDocuments({ apartmentId, deliveredAt: { $gte: todayStart } }),
        Delivery.countDocuments({ apartmentId, status: 'pending' }),
        Delivery.countDocuments({ apartmentId }),
      ]);

    return {
      totalFlats,
      totalResidents,
      todayDeliveries,
      pendingDeliveries,
      totalDeliveries,
    };
  }
}
