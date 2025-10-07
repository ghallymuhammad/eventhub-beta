import { useState, useCallback } from 'react';
import { ErrorHandler, ErrorType } from '@/lib/errorHandler';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showToast?: boolean;
}

/**
 * Hook for handling async operations with error handling
 */
export function useAsync<T = any>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      
      if (options.showToast !== false) {
        ErrorHandler.handleApiError(error);
      }
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, [asyncFunction, options]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for handling form submissions with error handling
 */
export function useFormSubmit<T = any>(
  submitFunction: (data: any) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const [state, setState] = useState<AsyncState<T> & { validationErrors: Record<string, string> }>({
    data: null,
    loading: false,
    error: null,
    validationErrors: {},
  });

  const submit = useCallback(async (formData: any) => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      validationErrors: {} 
    }));

    try {
      const data = await submitFunction(formData);
      setState(prev => ({ 
        ...prev, 
        data, 
        loading: false, 
        error: null 
      }));
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
      
      return data;
    } catch (error: any) {
      // Handle validation errors
      if (error.type === ErrorType.VALIDATION_ERROR && error.details) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          validationErrors: error.details 
        }));
        
        if (options.showToast !== false) {
          ErrorHandler.handleValidationError(error.details);
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Submission failed';
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorMessage 
        }));
        
        if (options.showToast !== false) {
          ErrorHandler.handleApiError(error);
        }
      }
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, [submitFunction, options]);

  const reset = useCallback(() => {
    setState({ 
      data: null, 
      loading: false, 
      error: null, 
      validationErrors: {} 
    });
  }, []);

  const clearValidationError = useCallback((field: string) => {
    setState(prev => {
      const { [field]: removed, ...rest } = prev.validationErrors;
      return {
        ...prev,
        validationErrors: rest,
      };
    });
  }, []);

  return {
    ...state,
    submit,
    reset,
    clearValidationError,
  };
}

/**
 * Hook for retrying failed operations
 */
export function useRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const executeWithRetry = useCallback(async (): Promise<T> => {
    let attempt = 0;
    
    while (attempt <= maxRetries) {
      try {
        if (attempt > 0) {
          setIsRetrying(true);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
        
        const result = await operation();
        setRetryCount(0);
        setIsRetrying(false);
        return result;
      } catch (error) {
        attempt++;
        setRetryCount(attempt);
        
        if (attempt > maxRetries) {
          setIsRetrying(false);
          throw error;
        }
      }
    }
    
    throw new Error('Max retries exceeded');
  }, [operation, maxRetries, retryDelay]);

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    maxRetries,
  };
}

export default useAsync;
