import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { eventId, tickets, totalAmount, originalAmount, pointsUsed = 0, couponId } = await request.json();

    if (!eventId || !tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Event ID and tickets are required' 
      }, { status: 400 });
    }

    // Validate event exists and is published
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { 
        ticketTypes: true,
        organizer: true
      }
    });

    if (!event) {
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }

    if (!event.isPublished) {
      return NextResponse.json({ 
        success: false, 
        error: 'Event is not available for booking' 
      }, { status: 400 });
    }

    // Validate coupon if provided
    let coupon = null;
    if (couponId) {
      coupon = await prisma.coupon.findUnique({
        where: { id: couponId }
      });

      if (!coupon || !coupon.isActive || (coupon.expiresAt && new Date() > coupon.expiresAt)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid or expired coupon' 
        }, { status: 400 });
      }

      // Check usage limits
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ 
          success: false, 
          error: 'Coupon usage limit exceeded' 
        }, { status: 400 });
      }
    }

    // Calculate deadlines
    const paymentDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const adminDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

    // Create transaction (basic fields for now - will be updated when DB is migrated)
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        eventId,
        totalAmount: totalAmount || 0,
        status: 'WAITING_PAYMENT' as any,
        couponId: couponId || null
      } as any,
      include: {
        event: {
          include: {
            organizer: true
          }
        },
        user: true
      }
    });

    // Create transaction tickets for each ticket type
    const transactionTickets = [];
    for (const ticket of tickets) {
      const transactionTicket = await prisma.transactionTicket.create({
        data: {
          transactionId: transaction.id,
          ticketTypeId: ticket.ticketTypeId || 'default', // Handle legacy tickets
          quantity: ticket.quantity,
          unitPrice: ticket.price
        }
      });
      transactionTickets.push(transactionTicket);
    }

    // Update coupon usage if used
    if (coupon) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: {
          usedCount: coupon.usedCount + 1
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        transaction: {
          ...transaction,
          transactionTickets
        },
        message: 'Transaction created successfully'
      }
    });

  } catch (error) {
    console.error('Transaction creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create transaction'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereClause: any = {
      userId: session.user.id
    };

    if (status) {
      whereClause.status = status;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        event: true,
        transactionTickets: {
          include: {
            ticketType: true
          }
        },
        coupon: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transactions'
    }, { status: 500 });
  }
}
