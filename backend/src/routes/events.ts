import express from 'express';
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Get all published events
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      isPublished: true,
      status: 'APPROVED'
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    });

    const total = await prisma.event.count({ where });

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single event by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
