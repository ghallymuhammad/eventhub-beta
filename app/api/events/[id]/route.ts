import { EventController } from '@/src/controllers/eventController';

export const GET = EventController.getEventById;
export const PUT = EventController.updateEvent;
export const DELETE = EventController.deleteEvent;
