import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { withApiErrorHandling, createApiSuccess, validateApiRequest } from '@/lib/apiErrorHandler';

// GET /api/events/test - Test database connection
export const GET = withApiErrorHandling(async (request: NextRequest) => {
  console.log('Testing database connection...');
  
  // Test getting events
  const events = await DatabaseService.getEvents({ limit: 5 });
  
  return createApiSuccess({
    eventsCount: events.length,
    events: events,
  }, 'Database connection successful!');
});

// POST /api/events/test - Test creating an event
export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  // Validate required fields
  const validationErrors = validateApiRequest(body, ['organizerId']);
  if (validationErrors.length > 0) {
    return NextResponse.json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: validationErrors,
      },
      timestamp: new Date().toISOString(),
    }, { status: 400 });
  }
  
  // Create a test event
  const testEvent = await DatabaseService.createEvent({
    title: body.title || 'Test Event',
    description: 'This is a test event created via API',
    fullDescription: 'A longer description of the test event',
    date: new Date(body.date || '2024-12-31'),
    time: '19:00',
    location: 'Test Location',
    category: 'Technology',
    image: 'https://via.placeholder.com/800x400',
    capacity: 100,
    price: 50000,
    organizerId: body.organizerId,
    ticketTypes: [
      {
        name: 'General Admission',
        price: 50000,
        quantity: 80,
        description: 'Standard entry'
      },
      {
        name: 'VIP',
        price: 100000,
        quantity: 20,
        description: 'VIP access with premium benefits'
      }
    ]
  });

  return createApiSuccess(testEvent, 'Test event created successfully!', 201);
});
