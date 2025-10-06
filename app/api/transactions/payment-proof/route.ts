import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const transactionId = formData.get('transactionId') as string;
    const file = formData.get('paymentProof') as File;

    if (!transactionId || !file) {
      return NextResponse.json({ 
        success: false, 
        error: 'Transaction ID and payment proof file are required' 
      }, { status: 400 });
    }

    // Verify transaction belongs to user and is in correct status
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: session.user.id,
        status: 'WAITING_PAYMENT'
      }
    });

    if (!transaction) {
      return NextResponse.json({ 
        success: false, 
        error: 'Transaction not found or not in valid status' 
      }, { status: 404 });
    }

    // Check if payment deadline has passed
    if (new Date() > new Date(transaction.paymentDeadline)) {
      // Automatically expire the transaction
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { 
          status: 'EXPIRED',
          updatedAt: new Date()
        }
      });
      
      return NextResponse.json({ 
        success: false, 
        error: 'Payment deadline has expired' 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Please upload an image file (JPEG, PNG, GIF)' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 5MB' 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment-proofs');
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${transactionId}-${timestamp}.${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      // If directory doesn't exist, create it and try again
      const fs = require('fs');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        await writeFile(filePath, buffer);
      } else {
        throw error;
      }
    }

    // Update transaction with payment proof
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentProof: `/uploads/payment-proofs/${fileName}`,
        status: 'WAITING_CONFIRMATION',
        updatedAt: new Date()
      },
      include: {
        event: {
          select: {
            title: true,
            date: true,
            location: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment proof uploaded successfully',
      data: updatedTransaction
    });

  } catch (error) {
    console.error('Error uploading payment proof:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload payment proof'
      },
      { status: 500 }
    );
  }
}
