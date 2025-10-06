import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { UserRole } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ORGANIZER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizerId = session.user.id;

    // Get organizer statistics
    const [
      totalEvents,
      totalRevenue,
      totalTicketsSold,
      upcomingEvents,
      recentTransactions
    ] = await Promise.all([
      // Total events count
      prisma.event.count({
        where: { organizerId }
      }),

      // Total revenue from transactions
      prisma.transaction.aggregate({
        where: {
          event: { organizerId },
          status: 'CONFIRMED'
        },
        _sum: { totalAmount: true }
      }),

      // Total tickets sold
      prisma.transaction.aggregate({
        where: {
          event: { organizerId },
          status: 'CONFIRMED'
        },
        _sum: { quantity: true }
      }),

      // Upcoming events count
      prisma.event.count({
        where: {
          organizerId,
          date: { gte: new Date() }
        }
      }),

      // Recent transactions
      prisma.transaction.findMany({
        where: {
          event: { organizerId }
        },
        include: {
          event: {
            select: { title: true, date: true }
          },
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Monthly revenue chart data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM("totalAmount") as revenue,
        COUNT(*) as transactions
      FROM "Transaction" t
      INNER JOIN "Event" e ON t."eventId" = e.id
      WHERE e."organizerId" = ${organizerId}
        AND t.status = 'CONFIRMED'
        AND t."createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    const stats = {
      overview: {
        totalEvents,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalTicketsSold: totalTicketsSold._sum.quantity || 0,
        upcomingEvents
      },
      recentTransactions,
      monthlyRevenue
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching organizer stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
