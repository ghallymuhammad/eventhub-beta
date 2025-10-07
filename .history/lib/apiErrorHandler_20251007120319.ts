import { NextResponse } from 'next/server';
import { ErrorHandler, ErrorType } from '@/lib/errorHandler';

/**
 * API Error Handler Middleware
 * Standardizes error responses across all API routes
 */
export function handleApiError(error: any) {
  console.error('API Error:', error);

  // Handle Prisma/Database errors
  if (error.code && error.code.startsWith('P')) {
    const dbError = ErrorHandler.handleDatabaseError(error);
    return NextResponse.json(
      ErrorHandler.createErrorResponse(
        dbError.type,
        dbError.message,
        dbError.statusCode
      ),
      { status: dbError.statusCode }
    );
  }

  // Handle validation errors
  if (error.name === 'ValidationError' || error.issues) {
    return NextResponse.json(
      ErrorHandler.createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'Validation failed',
        400,
        error.issues || error.details
      ),
      { status: 400 }
    );
  }

  // Handle authentication errors
  if (error.message?.includes('Unauthorized') || error.status === 401) {
    return NextResponse.json(
      ErrorHandler.createErrorResponse(
        ErrorType.AUTHENTICATION_ERROR,
        'Authentication required',
        401
      ),
      { status: 401 }
    );
  }

  // Handle authorization errors
  if (error.message?.includes('Forbidden') || error.status === 403) {
    return NextResponse.json(
      ErrorHandler.createErrorResponse(
        ErrorType.AUTHORIZATION_ERROR,
        'Insufficient permissions',
        403
      ),
      { status: 403 }
    );
  }

  // Handle not found errors
  if (error.message?.includes('Not found') || error.status === 404) {
    return NextResponse.json(
      ErrorHandler.createErrorResponse(
        ErrorType.NOT_FOUND_ERROR,
        'Resource not found',
        404
      ),
      { status: 404 }
    );
  }

  // Default server error
  ErrorHandler.logError(error);
  return NextResponse.json(
    ErrorHandler.createErrorResponse(
      ErrorType.SERVER_ERROR,
      process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error',
      500,
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    ),
    { status: 500 }
  );
}

/**
 * Async wrapper for API route handlers
 */
export function withApiErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Validation helper for API requests
 */
export function validateApiRequest(
  body: any,
  requiredFields: string[]
): string[] {
  const errors: string[] = [];

  for (const field of requiredFields) {
    if (!body[field]) {
      errors.push(`${field} is required`);
    }
  }

  return errors;
}

/**
 * Success response helper
 */
export function createApiSuccess<T>(
  data: T,
  message?: string,
  status: number = 200
) {
  return NextResponse.json(
    ErrorHandler.createSuccessResponse(data, message),
    { status }
  );
}
