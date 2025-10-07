# 🛡️ EventHub Error Handling System

## Overview

EventHub now includes a comprehensive error handling system that provides consistent error management across the entire application, from the frontend React components to the backend API routes.

## 📋 Error Handling Components

### 1. **React Error Boundary** (`components/ErrorBoundary.tsx`)
- Catches JavaScript errors anywhere in the React component tree
- Displays fallback UI when errors occur
- Logs errors for debugging (development mode)
- Provides recovery options (retry, refresh, go home)

### 2. **Error Handler Utilities** (`lib/errorHandler.ts`)
- **`AppError` class**: Custom error type with metadata
- **`ErrorHandler` class**: Centralized error processing
- **Error types**: Network, validation, auth, payment, etc.
- **Toast notifications**: User-friendly error messages
- **Error logging**: Structured error tracking

### 3. **API Error Handler** (`lib/apiErrorHandler.ts`)
- **`withApiErrorHandling`**: Wrapper for API routes
- **Standardized responses**: Consistent API error format
- **Validation helpers**: Request validation utilities
- **Status code mapping**: Proper HTTP error responses

### 4. **React Hooks** (`hooks/useAsync.ts`)
- **`useAsync`**: Handle async operations with error states
- **`useFormSubmit`**: Form submission with validation errors
- **`useRetry`**: Automatic retry for failed operations

## 🚀 Usage Examples

### **Frontend Error Handling**

```tsx
import { useAsync, useFormSubmit } from '@/hooks/useAsync';
import { ErrorHandler } from '@/lib/errorHandler';

// Async data fetching with error handling
function EventList() {
  const { data, loading, error, execute } = useAsync(
    () => fetch('/api/events').then(res => res.json()),
    {
      onSuccess: (data) => console.log('Events loaded:', data),
      onError: (error) => console.log('Failed to load events:', error),
      showToast: true, // Automatically show error toast
    }
  );

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data?.events?.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}

// Form submission with validation errors
function CreateEventForm() {
  const { submit, loading, validationErrors, clearValidationError } = useFormSubmit(
    (formData) => fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).then(res => res.json()),
    {
      onSuccess: () => router.push('/organizer'),
      showToast: true,
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await submit(Object.fromEntries(formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="title" 
        placeholder="Event Title"
        onChange={() => clearValidationError('title')}
      />
      {validationErrors.title && (
        <span className="text-red-500">{validationErrors.title}</span>
      )}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}
```

### **API Route Error Handling**

```typescript
// app/api/events/route.ts
import { withApiErrorHandling, createApiSuccess, validateApiRequest } from '@/lib/apiErrorHandler';

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const events = await DatabaseService.getEvents();
  return createApiSuccess(events, 'Events retrieved successfully');
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  // Validate required fields
  const errors = validateApiRequest(body, ['title', 'description', 'organizerId']);
  if (errors.length > 0) {
    throw new AppError('Validation failed', ErrorType.VALIDATION_ERROR, 400);
  }
  
  const event = await DatabaseService.createEvent(body);
  return createApiSuccess(event, 'Event created successfully', 201);
});
```

### **Database Error Handling**

```typescript
// Updated database service with error handling
export class DatabaseService {
  static async createEvent(eventData: CreateEventData) {
    try {
      return await prisma.event.create({
        data: eventData,
        include: { organizer: true, ticketTypes: true }
      });
    } catch (error) {
      // Let the API error handler deal with Prisma errors
      throw ErrorHandler.handleDatabaseError(error);
    }
  }

  static async getUserByEmail(email: string) {
    try {
      return await prisma.user.findUnique({ where: { email } });
    } catch (error) {
      throw ErrorHandler.handleDatabaseError(error);
    }
  }
}
```

## 🎯 Error Types & Responses

### **Frontend Error Types**
```typescript
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',          // Connection issues
  VALIDATION_ERROR = 'VALIDATION_ERROR',     // Form validation
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR', // Login required
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',   // Permission denied
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',      // Resource not found
  SERVER_ERROR = 'SERVER_ERROR',            // Internal server error
  DATABASE_ERROR = 'DATABASE_ERROR',        // Database operation failed
  PAYMENT_ERROR = 'PAYMENT_ERROR',          // Payment processing
}
```

### **API Response Format**
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    type: ErrorType;
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}

// Success Response Example
{
  "success": true,
  "data": { "events": [...] },
  "timestamp": "2024-10-07T10:30:00Z"
}

// Error Response Example
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": ["title is required", "organizerId is required"]
  },
  "timestamp": "2024-10-07T10:30:00Z"
}
```

## 🔧 Error Recovery Strategies

### **1. Automatic Retry**
```typescript
const { executeWithRetry, retryCount, isRetrying } = useRetry(
  () => fetch('/api/events'),
  3, // max retries
  1000 // delay between retries
);
```

### **2. Fallback UI**
```tsx
<ErrorBoundary fallback={CustomErrorComponent}>
  <EventList />
</ErrorBoundary>
```

### **3. Manual Recovery**
```tsx
function EventList() {
  const { data, error, execute } = useAsync(fetchEvents);
  
  if (error) {
    return (
      <div className="error-state">
        <p>Failed to load events</p>
        <button onClick={execute}>Try Again</button>
      </div>
    );
  }
  
  return <div>{/* Event list */}</div>;
}
```

## 📊 Error Monitoring & Logging

### **Development Mode**
- Console logging with detailed error information
- Stack traces for debugging
- Error details displayed in UI

### **Production Mode**
- Sanitized error messages for users
- Structured logging for analysis
- Error reporting to monitoring services

### **Future Integrations**
```typescript
// lib/errorHandler.ts - logError method
static logError(error: Error, context?: any): void {
  // TODO: Integrate with error monitoring services
  
  // Sentry integration
  // Sentry.captureException(error, { extra: context });
  
  // LogRocket integration
  // LogRocket.captureException(error);
  
  // Custom analytics
  // analytics.track('error', { error: error.message, context });
}
```

## 🚀 Benefits

1. **Consistent UX**: Standardized error messages across the app
2. **Better Debugging**: Detailed error information in development
3. **Improved Reliability**: Automatic error recovery and retry mechanisms
4. **User-Friendly**: Clear, actionable error messages for users
5. **Maintainable**: Centralized error handling logic
6. **Scalable**: Easy to extend with new error types and handlers

## 📝 Best Practices

1. **Always wrap async operations** in try-catch or use the provided hooks
2. **Use specific error types** rather than generic errors
3. **Provide recovery options** when possible (retry, refresh, alternative paths)
4. **Log errors appropriately** (detailed in dev, sanitized in prod)
5. **Test error scenarios** to ensure proper handling
6. **Keep error messages user-friendly** and actionable

Your EventHub application now has enterprise-level error handling that will provide a much better user experience and easier debugging! 🎉
