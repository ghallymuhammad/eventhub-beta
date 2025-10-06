import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { UserRole, TransactionStatus } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { PointsService } from '@/src/services/pointsService';
import { CouponService } from '@/src/services/couponService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ORGANIZER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const transactionId = params.id;
    const organizerId = session.user.id;

    // Verify the transaction belongs to the organizer's event
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        event: { organizerId }
      },
      include: {
        event: true,
        user: true
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Use transaction for atomic operations
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: { status },
        include: {
          event: true,
          user: true
        }
      });

      // Handle status-specific logic
      if (status === TransactionStatus.REJECTED && transaction.status !== TransactionStatus.REJECTED) {
        // Refund logic: restore points/coupons and event seats
        if (transaction.pointsUsed > 0) {
          await PointsService.addPoints(
            tx,
            transaction.userId,
            transaction.pointsUsed,
            `Refund for rejected transaction ${transaction.id}`,
            transaction.eventId
          );
        }

        if (transaction.couponId) {
          // Mark coupon as unused
          await tx.coupon.update({
            where: { id: transaction.couponId },
            data: { isUsed: false }
          });
        }

        // Restore event seats
        await tx.event.update({
          where: { id: transaction.eventId },
          data: {
            availableSeats: {
              increment: transaction.quantity
            }
          }
        });
      } else if (status === TransactionStatus.CONFIRMED && transaction.status !== TransactionStatus.CONFIRMED) {
        // Award points for successful purchase (2% of total amount)
        const pointsToAward = Math.floor(transaction.totalAmount * 0.02);
        if (pointsToAward > 0) {
          await PointsService.addPoints(
            tx,
            transaction.userId,
            pointsToAward,
            `Purchase reward for event ${transaction.event.title}`,
            transaction.eventId
          );
        }
      }

      return updated;
    });

    // TODO: Send notification email based on status
    // This would be implemented with a proper email service
    console.log(`Transaction ${transactionId} status updated to ${status}`);
    console.log(`Email notification should be sent to ${transaction.user.email}`);

    return NextResponse.json({
      success: true,
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update transaction status' },
      { status: 500 }
    );
  }
}
