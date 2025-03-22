export enum UserRole {
  ADMIN = "ADMIN",
  ORGANIZER = "ORGANIZER",
  ATTENDEE = "ATTENDEE",
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  bannerImage: string;
  startDateTime: Date;
  endDateTime: Date;
  location: string;
  organizerId: string;
  price: number;
  maxAttendees: number;
  isPaid: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketCategory {
  id: string;
  name: string;
  description: string;
  price: number;
  eventId: string;
  maxQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  qrCode: string;
  isCheckedIn: boolean;
  userId: string;
  eventId: string;
  categoryId: string;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  paymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
} 