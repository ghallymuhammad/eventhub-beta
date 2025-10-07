import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET /api/events/test - Test database connection
export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test getting events
    const events = await DatabaseService.getEvents({ limit: 5 });
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        eventsCount: events.length,
        events: events,
      }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/events/test - Test creating an event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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

    return NextResponse.json({
      success: true,
      message: 'Test event created successfully!',
      data: testEvent
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create test event:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create test event',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
