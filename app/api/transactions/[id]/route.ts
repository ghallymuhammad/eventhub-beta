import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        event: {
          select: {
            title: true,
            date: true,
            location: true
          }
        },
        coupon: {
          select: {
            code: true,
            discountType: true,
            discountValue: true
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json({ 
        success: false, 
        error: 'Transaction not found' 
      }, { status: 404 });
    }

    // Check if transaction should be auto-expired
    if (transaction.status === 'WAITING_PAYMENT' && 
        transaction.paymentDeadline && 
        new Date() > new Date(transaction.paymentDeadline)) {
      
      // Auto-expire the transaction
      const updatedTransaction = await prisma.transaction.update({
        where: { id: params.id },
        data: { 
          status: 'EXPIRED',
          updatedAt: new Date()
        },
        include: {
          event: {
            select: {
              title: true,
              date: true,
              location: true
            }
          },
          coupon: {
            select: {
              code: true,
              discountType: true,
              discountValue: true
            }
          }
        }
      });

      // Restore event capacity and refund points/coupons
      await restoreTransactionResources(updatedTransaction);

      return NextResponse.json({
        success: true,
        data: updatedTransaction
      });
    }

    return NextResponse.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transaction'
      },
      { status: 500 }
    );
  }
}

async function restoreTransactionResources(transaction: any) {
  await prisma.$transaction(async (tx) => {
    // Restore event capacity
    await tx.event.update({
      where: { id: transaction.eventId },
      data: {
        availableSeats: {
          increment: transaction.quantity
        }
      }
    });

    // Refund points if used
    if (transaction.pointsUsed > 0) {
      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          pointsBalance: {
            increment: transaction.pointsUsed
          }
        }
      });

      // Create point restoration record
      await tx.point.create({
        data: {
          userId: transaction.userId,
          amount: transaction.pointsUsed,
          description: `Points refunded - Transaction ${transaction.id} expired`,
          isUsed: false,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        }
      });
    }

    // Restore coupon usage if applicable
    if (transaction.couponId) {
      await tx.coupon.update({
        where: { id: transaction.couponId },
        data: {
          usedCount: {
            decrement: 1
          }
        }
      });
    }
  });
}
