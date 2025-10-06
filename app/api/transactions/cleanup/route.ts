import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be called by a cron job or scheduler
    // For security, you might want to add API key authentication
    
    const now = new Date();

    // Find transactions that should be expired (payment deadline passed)
    const expiredTransactions = await prisma.transaction.findMany({
      where: {
        status: 'WAITING_PAYMENT',
        paymentDeadline: {
          lt: now
        }
      },
      include: {
        event: true,
        user: true,
        coupon: true
      }
    });

    // Find transactions that should be cancelled (waiting confirmation too long - 3 days)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const cancelledTransactions = await prisma.transaction.findMany({
      where: {
        status: 'WAITING_CONFIRMATION',
        updatedAt: {
          lt: threeDaysAgo
        }
      },
      include: {
        event: true,
        user: true,
        coupon: true
      }
    });

    let processedCount = 0;

    // Process expired transactions
    for (const transaction of expiredTransactions) {
      await prisma.$transaction(async (tx) => {
        // Update transaction status
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { 
            status: 'EXPIRED',
            updatedAt: now
          }
        });

        // Restore event capacity
        if (transaction.event) {
          await tx.event.update({
            where: { id: transaction.eventId },
            data: {
              availableSeats: {
                increment: transaction.quantity
              }
            }
          });
        }

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

      processedCount++;
    }

    // Process cancelled transactions (same logic as expired)
    for (const transaction of cancelledTransactions) {
      await prisma.$transaction(async (tx) => {
        // Update transaction status
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { 
            status: 'CANCELLED',
            updatedAt: now
          }
        });

        // Restore event capacity
        if (transaction.event) {
          await tx.event.update({
            where: { id: transaction.eventId },
            data: {
              availableSeats: {
                increment: transaction.quantity
              }
            }
          });
        }

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
              description: `Points refunded - Transaction ${transaction.id} cancelled`,
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

      processedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} transactions`,
      data: {
        expired: expiredTransactions.length,
        cancelled: cancelledTransactions.length,
        total: processedCount
      }
    });

  } catch (error) {
    console.error('Error processing transaction cleanup:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process transaction cleanup'
      },
      { status: 500 }
    );
  }
}
