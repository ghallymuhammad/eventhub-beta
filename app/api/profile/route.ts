import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        referralCode: true,
        referredById: true,
        createdAt: true,
        points: {
          where: {
            expiresAt: {
              gte: new Date()
            }
          },
          select: {
            amount: true,
            expiresAt: true
          }
        },
        coupons: {
          where: {
            isUsed: false,
            expiresAt: {
              gte: new Date()
            }
          },
          select: {
            id: true,
            code: true,
            discount: true,
            discountType: true,
            expiresAt: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const totalPoints = user.points.reduce((sum, point) => sum + point.amount, 0)

    return NextResponse.json({
      user: {
        ...user,
        totalPoints
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, password: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: any = {}

    // Update name if provided
    if (validatedData.name) {
      updateData.name = validatedData.name
    }

    // Update email if provided and different
    if (validatedData.email && validatedData.email !== user.email) {
      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })
      
      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
      
      updateData.email = validatedData.email
    }

    // Update password if provided
    if (validatedData.newPassword) {
      if (!validatedData.currentPassword) {
        return NextResponse.json({ error: 'Current password required' }, { status: 400 })
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        validatedData.currentPassword,
        user.password
      )

      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      updateData.password = await bcrypt.hash(validatedData.newPassword, 12)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Profile update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
