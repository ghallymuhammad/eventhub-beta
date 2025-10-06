export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
  profilePicture?: string;
  phoneNumber?: string;
  referralCode: string;
  referredBy?: string;
  pointsBalance: number;
  createdAt: Date;
  updatedAt: Date;
  emailVerified?: Date;
}

export interface Point {
  id: string;
  userId: string;
  amount: number;
  type: 'REFERRAL_BONUS' | 'EVENT_REWARD' | 'PURCHASE_CASHBACK' | 'EXPIRY_DEDUCTION';
  description?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  type: 'REFERRAL_REWARD' | 'ORGANIZER_VOUCHER' | 'SYSTEM_PROMOTION';
  organizerId?: string;
  eventId?: string;
  userId?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  date: Date;
  time: string;
  location: string;
  category: string;
  image?: string;
  capacity: number;
  price?: number;
  isPublished: boolean;
  organizerId: string;
  organizer?: User;
  ticketTypes?: TicketType[];
  transactions?: Transaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
  quantity: number;
  sold: number;
  eventId: string;
}

export interface Transaction {
  id: string;
  userId: string;
  eventId: string;
  totalAmount: number;
  originalAmount: number;
  discountAmount: number;
  pointsUsed: number;
  pointsValue: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REJECTED';
  paymentMethod?: string;
  paymentReference?: string;
  paymentProof?: string;
  adminNotes?: string;
  couponId?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  event?: Event;
  coupon?: Coupon;
}

export interface Ticket {
  id: string;
  ticketCode: string;
  userId: string;
  transactionId: string;
  ticketTypeId: string;
  status: 'ACTIVE' | 'USED' | 'CANCELLED';
  usedAt?: Date;
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  eventId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}
