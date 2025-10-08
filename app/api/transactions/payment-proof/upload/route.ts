import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { getEmailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { transactionId, paymentProofUrl } = await request.json();

    if (!transactionId || !paymentProofUrl) {
      return NextResponse.json({
        success: false,
        error: 'Transaction ID and payment proof URL are required'
      }, { status: 400 });
    }

    // Find the transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: session.user.id
      },
      include: {
        event: true,
        user: true
      }
    });

    if (!transaction) {
      return NextResponse.json({
        success: false,
        error: 'Transaction not found'
      }, { status: 404 });
    }

    // Check if transaction is in correct status
    if (transaction.status !== 'WAITING_PAYMENT') {
      return NextResponse.json({
        success: false,
        error: 'Transaction is not waiting for payment'
      }, { status: 400 });
    }

    // Calculate admin deadline (3 days from now)
    const adminDeadline = new Date();
    adminDeadline.setDate(adminDeadline.getDate() + 3);

    // Update transaction with payment proof
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentProof: paymentProofUrl,
        status: 'PENDING'
      }
    });

    // Send payment confirmation email
    try {
      const emailService = getEmailService();
      await emailService.sendPaymentConfirmationEmail(
        transaction.user.email,
        transaction.user.name || 'Customer',
        transaction.event.title,
        transaction.id
      );
      
      console.log(`Payment confirmation email sent for transaction ${transactionId}`);
    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
      // Don't fail the upload if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        transaction: updatedTransaction,
        message: 'Payment proof uploaded successfully. You will receive a confirmation email shortly.'
      }
    });

  } catch (error) {
    console.error('Error uploading payment proof:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload payment proof'
    }, { status: 500 });
  }
}
