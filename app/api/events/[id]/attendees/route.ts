import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { UserRole } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ORGANIZER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = params.id;
    const organizerId = session.user.id;

    // Verify the event belongs to the organizer
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId
      }
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get attendees (users with confirmed transactions)
    const attendees = await prisma.transaction.findMany({
      where: {
        eventId,
        status: 'CONFIRMED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to get unique attendees with their ticket quantities
    const attendeeMap = new Map();
    
    attendees.forEach((transaction) => {
      const userId = transaction.user.id;
      if (attendeeMap.has(userId)) {
        attendeeMap.get(userId).ticketCount += transaction.quantity;
        attendeeMap.get(userId).totalPaid += transaction.totalAmount;
      } else {
        attendeeMap.set(userId, {
          user: transaction.user,
          ticketCount: transaction.quantity,
          totalPaid: transaction.totalAmount,
          registrationDate: transaction.createdAt
        });
      }
    });

    const uniqueAttendees = Array.from(attendeeMap.values());

    // Get event statistics
    const stats = {
      totalAttendees: uniqueAttendees.length,
      totalTicketsSold: attendees.reduce((sum, t) => sum + t.quantity, 0),
      totalRevenue: attendees.reduce((sum, t) => sum + t.totalAmount, 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location
        },
        attendees: uniqueAttendees,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendees' },
      { status: 500 }
    );
  }
}
