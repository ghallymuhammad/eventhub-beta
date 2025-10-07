import toast from 'react-hot-toast';

// Error types for better error handling
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR', 
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
}

// Custom error class for application errors
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(
    message: string, 
    type: ErrorType = ErrorType.SERVER_ERROR, 
    statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }
}

// Standardized API response format
export interface ApiResponse<T = any> {
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

// Error handler utility class
export class ErrorHandler {
  /**
   * Handle API errors and show appropriate user feedback
   */
  static handleApiError(error: any): ApiResponse {
    console.error('API Error:', error);

    // Network/Connection errors
    if (!error.response) {
      toast.error('Connection failed. Please check your internet connection.');
      return {
        success: false,
        error: {
          type: ErrorType.NETWORK_ERROR,
          message: 'Network connection failed',
        },
        timestamp: new Date().toISOString(),
      };
    }

    const { status, data } = error.response;

    // Handle different status codes
    switch (status) {
      case 400:
        toast.error(data?.error?.message || 'Invalid request');
        return {
          success: false,
          error: {
            type: ErrorType.VALIDATION_ERROR,
            message: data?.error?.message || 'Validation failed',
            details: data?.error?.details,
          },
          timestamp: new Date().toISOString(),
        };

      case 401:
        toast.error('Please sign in to continue');
        // Redirect to sign in page
        window.location.href = '/signin';
        return {
          success: false,
          error: {
            type: ErrorType.AUTHENTICATION_ERROR,
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        };

      case 403:
        toast.error('You don\'t have permission to perform this action');
        return {
          success: false,
          error: {
            type: ErrorType.AUTHORIZATION_ERROR,
            message: 'Insufficient permissions',
          },
          timestamp: new Date().toISOString(),
        };

      case 404:
        toast.error('The requested resource was not found');
        return {
          success: false,
          error: {
            type: ErrorType.NOT_FOUND_ERROR,
            message: 'Resource not found',
          },
          timestamp: new Date().toISOString(),
        };

      case 500:
      default:
        toast.error('Something went wrong on our end. Please try again later.');
        return {
          success: false,
          error: {
            type: ErrorType.SERVER_ERROR,
            message: 'Internal server error',
          },
          timestamp: new Date().toISOString(),
        };
    }
  }

  /**
   * Handle form validation errors
   */
  static handleValidationError(errors: Record<string, string>): void {
    const errorMessages = Object.values(errors);
    if (errorMessages.length === 1) {
      toast.error(errorMessages[0]);
    } else {
      toast.error(`Please fix the following errors:\n${errorMessages.join('\n')}`);
    }
  }

  /**
   * Handle database operation errors
   */
  static handleDatabaseError(error: any): AppError {
    console.error('Database error:', error);

    // Prisma/Database specific errors
    if (error.code === 'P2002') {
      return new AppError(
        'A record with this information already exists',
        ErrorType.DATABASE_ERROR,
        400
      );
    }

    if (error.code === 'P2025') {
      return new AppError(
        'The record you\'re trying to access doesn\'t exist',
        ErrorType.NOT_FOUND_ERROR,
        404
      );
    }

    // Connection errors
    if (error.code === 'P1001') {
      return new AppError(
        'Database connection failed',
        ErrorType.DATABASE_ERROR,
        503
      );
    }

    return new AppError(
      'Database operation failed',
      ErrorType.DATABASE_ERROR,
      500
    );
  }

  /**
   * Handle payment-related errors
   */
  static handlePaymentError(error: any): void {
    console.error('Payment error:', error);
    
    if (error.type === 'insufficient_funds') {
      toast.error('Insufficient balance. Please check your payment method.');
    } else if (error.type === 'payment_expired') {
      toast.error('Payment window has expired. Please try booking again.');
    } else if (error.type === 'payment_rejected') {
      toast.error('Payment was rejected. Please contact support if this continues.');
    } else {
      toast.error('Payment processing failed. Please try again.');
    }
  }

  /**
   * Create standardized success response
   */
  static createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create standardized error response
   */
  static createErrorResponse(
    type: ErrorType,
    message: string,
    statusCode: number = 500,
    details?: any
  ): ApiResponse {
    return {
      success: false,
      error: {
        type,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Log error to external service (implement based on your monitoring solution)
   */
  static logError(error: Error, context?: any): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorData);
    }

    // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: errorData });
  }
}

// Async wrapper for better error handling
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorHandler.logError(error as Error);
      ErrorHandler.handleApiError(error);
      return null;
    }
  };
}
