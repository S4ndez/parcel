export type UserRole = 'super_admin' | 'apartment_manager';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  apartmentId?: string | IApartment;
  createdAt?: string;
  updatedAt?: string;
}

export interface IApartment {
  _id: string;
  name: string;
  address: string;
  qrCode?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface IFlat {
  _id: string;
  apartmentId: string | IApartment;
  flatNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IResident {
  _id: string;
  apartmentId: string | IApartment;
  flatId: string | IFlat;
  name: string;
  whatsappNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IDelivery {
  _id: string;
  apartmentId: string | IApartment;
  flatId: string | IFlat;
  courier: string;
  trackingNumber?: string;
  status: 'pending' | 'collected';
  deliveredAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  apartmentId?: string;
  name: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}
