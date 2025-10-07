import { prisma } from '@/src/lib/prisma';
import { 
  Event, 
  User, 
  Transaction, 
  TransactionStatus, 
  Role,
  TicketType 
} from '@prisma/client';

// Extended types for API responses
export type EventWithDetails = Event & {
  organizer: Pick<User, 'id' | 'name' | 'email'>;
  ticketTypes: TicketType[];
  _count: {
    reviews: number;
    transactions: number;
  };
};

export type TransactionWithDetails = Transaction & {
  event: {
    id: string;
    title: string;
    date: Date;
    location: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
};

/**
 * Database operations for EventHub
 */
export class DatabaseService {
  
  // ================== EVENT OPERATIONS ==================
  
  /**
   * Get all public events with filters
   */
  static async getEvents(filters: {
    search?: string;
    category?: string;
    location?: string;
    organizerId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<EventWithDetails[]> {
    const { search, category, location, organizerId, limit = 20, offset = 0 } = filters;

    return await prisma.event.findMany({
      where: {
        ...(organizerId && { organizerId }),
        ...(category && { category }),
        ...(location && { 
          location: { contains: location, mode: 'insensitive' } 
        }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        date: { gte: new Date() }, // Only future events
      },
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        },
        ticketTypes: true,
        _count: {
          select: { reviews: true, transactions: true }
        }
      },
      orderBy: { date: 'asc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get single event by ID
   */
  static async getEventById(eventId: string): Promise<EventWithDetails | null> {
    return await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        },
        ticketTypes: true,
        _count: {
          select: { reviews: true, transactions: true }
        }
      },
    });
  }

  /**
   * Create new event
   */
  static async createEvent(eventData: {
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
    organizerId: string;
    ticketTypes: {
      name: string;
      price: number;
      quantity: number;
      description?: string;
    }[];
  }): Promise<EventWithDetails> {
    const { ticketTypes, ...eventFields } = eventData;

    return await prisma.event.create({
      data: {
        ...eventFields,
        ticketTypes: {
          create: ticketTypes,
        },
      },
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        },
        ticketTypes: true,
        _count: {
          select: { reviews: true, transactions: true }
        }
      },
    });
  }

  // ================== USER OPERATIONS ==================
  
  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Create new user
   */
  static async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: Role;
    phoneNumber?: string;
    referredBy?: string;
  }): Promise<User> {
    return await prisma.user.create({
      data: userData,
    });
  }

  // ================== TRANSACTION OPERATIONS ==================
  
  /**
   * Create new transaction
   */
  static async createTransaction(transactionData: {
    userId: string;
    eventId: string;
    totalAmount: number;
    originalAmount: number;
    pointsUsed?: number;
    couponId?: string;
  }): Promise<Transaction> {
    return await prisma.transaction.create({
      data: {
        ...transactionData,
        status: 'WAITING_PAYMENT',
        paymentDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      },
    });
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    transactionId: string, 
    status: TransactionStatus,
    paymentProofUrl?: string
  ): Promise<Transaction> {
    return await prisma.transaction.update({
      where: { id: transactionId },
      data: { 
        status, 
        ...(paymentProofUrl && { paymentProofUrl }),
        ...(status === TransactionStatus.CONFIRMED && { confirmedAt: new Date() })
      },
    });
  }

  /**
   * Get transactions by user
   */
  static async getUserTransactions(userId: string): Promise<TransactionWithDetails[]> {
    return await prisma.transaction.findMany({
      where: { userId },
      include: {
        event: {
          select: { id: true, title: true, date: true, location: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get transactions for organizer
   */
  static async getOrganizerTransactions(organizerId: string): Promise<TransactionWithDetails[]> {
    return await prisma.transaction.findMany({
      where: {
        event: { organizerId }
      },
      include: {
        event: {
          select: { id: true, title: true, date: true, location: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ================== POINTS OPERATIONS ==================
  
  /**
   * Add points to user
   */
  static async addPointsToUser(
    userId: string,
    amount: number,
    type: 'REFERRAL_BONUS' | 'EVENT_REWARD' | 'PURCHASE_CASHBACK',
    description?: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: { pointsBalance: { increment: amount } }
      });

      // Create points record
      await tx.point.create({
        data: {
          userId,
          amount,
          type,
          description,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        }
      });
    });
  }

  /**
   * Use points for transaction
   */
  static async usePoints(userId: string, amount: number): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { 
          id: userId,
          pointsBalance: { gte: amount } // Ensure sufficient balance
        },
        data: { pointsBalance: { decrement: amount } }
      });
      return true;
    } catch {
      return false; // Insufficient balance
    }
  }
}
