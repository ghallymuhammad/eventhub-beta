import { prisma } from '../lib/prisma';
import type { Event } from '../types';

export class EventService {
  static async getAllEvents(): Promise<Event[]> {
    return await prisma.event.findMany({
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        ticketTypes: true,
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
  }

  static async getEventById(id: string): Promise<Event | null> {
    return await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        ticketTypes: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
  }

  static async getEventsByCategory(category: string): Promise<Event[]> {
    return await prisma.event.findMany({
      where: {
        category: {
          contains: category,
          mode: 'insensitive'
        }
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        ticketTypes: true
      },
      orderBy: {
        date: 'asc'
      }
    });
  }

  static async searchEvents(query: string): Promise<Event[]> {
    return await prisma.event.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            category: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            location: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        ticketTypes: true
      },
      orderBy: {
        date: 'asc'
      }
    });
  }

  static async createEvent(organizerId: string, eventData: any): Promise<Event> {
    return await prisma.event.create({
      data: {
        ...eventData,
        organizerId
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        ticketTypes: true
      }
    });
  }

  static async updateEvent(id: string, eventData: Partial<Event>): Promise<Event | null> {
    return await prisma.event.update({
      where: { id },
      data: eventData,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        ticketTypes: true
      }
    });
  }

  static async deleteEvent(id: string): Promise<void> {
    await prisma.event.delete({
      where: { id }
    });
  }

  static async getEventsByOrganizer(
    organizerId: string, 
    filters: { search?: string; category?: string; page?: number; limit?: number }
  ) {
    const { search, category, page = 1, limit = 10 } = filters;
    
    const where: any = { organizerId };
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true
            }
          },
          ticketTypes: true,
          _count: {
            select: {
              transactions: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.event.count({ where })
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getPublicEvents(filters: { search?: string; category?: string; page?: number; limit?: number }) {
    const { search, category, page = 1, limit = 10 } = filters;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true
            }
          },
          ticketTypes: true,
          _count: {
            select: {
              reviews: true
            }
          }
        },
        orderBy: { date: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.event.count({ where })
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}
