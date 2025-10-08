import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { getEmailService } from '@/lib/emailService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admins can approve payments
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    const { status, rejectionReason } = await request.json();
    const transactionId = params.id;

    // Validate status
    if (!['CONFIRMED', 'REJECTED'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status. Must be CONFIRMED or REJECTED'
      }, { status: 400 });
    }

    // Find the transaction with related data
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: true,
        event: {
          include: {
            organizer: true
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

    // Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        approvedAt: status === 'CONFIRMED' ? new Date() : null,
        approvedBy: session.user.id
      }
    });

    // If approved, send ticket email
    if (status === 'CONFIRMED') {
      try {
        const emailService = getEmailService();
        
        // Generate unique ticket ID
        const ticketId = `TIX-${transaction.id.slice(-8).toUpperCase()}-${Date.now().toString().slice(-6)}`;
        
        // Prepare ticket data
        const ticketData = {
          ticketId,
          userEmail: transaction.user.email,
          userName: transaction.user.name || 'Event Attendee',
          eventTitle: transaction.event.title,
          eventDate: new Date(transaction.event.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          eventLocation: transaction.event.location,
          eventTime: new Date(transaction.event.date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          ticketType: 'General Admission',
          seatNumber: undefined, // Add logic for seat assignment if needed
          totalAmount: transaction.totalAmount,
          qrData: JSON.stringify({
            ticketId,
            transactionId: transaction.id,
            eventId: transaction.event.id,
            userId: transaction.user.id,
            issuedAt: new Date().toISOString()
          })
        };

        // Send ticket email
        const emailSent = await emailService.sendTicketEmail(ticketData);
        
        if (emailSent) {
          // Update transaction with ticket info
          await prisma.transaction.update({
            where: { id: transactionId },
            data: {
              ticketId,
              ticketSentAt: new Date()
            }
          });

          console.log(`Ticket email sent successfully for transaction ${transactionId}`);
        } else {
          console.error(`Failed to send ticket email for transaction ${transactionId}`);
        }

      } catch (emailError) {
        console.error('Error sending ticket email:', emailError);
        // Don't fail the approval if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        transaction: updatedTransaction,
        message: status === 'CONFIRMED' 
          ? 'Payment approved and ticket email sent' 
          : 'Payment rejected'
      }
    });

  } catch (error) {
    console.error('Error updating transaction status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update transaction status'
    }, { status: 500 });
  }
}
