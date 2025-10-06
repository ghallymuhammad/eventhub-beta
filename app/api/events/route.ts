import { EventController } from '@/src/controllers/eventController';

export const GET = EventController.getAllEvents;
export const POST = EventController.createEvent;
