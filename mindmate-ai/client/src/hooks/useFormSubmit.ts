import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

type SubmitHandler<T> = (data: T) => Promise<void> | void;

interface UseFormSubmitOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface FormSubmitState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * A custom hook to handle form submissions with loading and error states.
 * @param form The form instance from react-hook-form
 * @param onSubmit The function to call when the form is submitted
 * @param options Additional options for success/error handling
 * @returns An object with form submission state and a submit handler
 */
function useFormSubmit<T>(
  form: UseFormReturn<T>,
  onSubmit: SubmitHandler<T>,
  options: UseFormSubmitOptions<T> = {}
): [() => Promise<void>, FormSubmitState] {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { handleSubmit, reset: resetForm } = form;
  const { onSuccess, onError, successMessage, errorMessage } = options;

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: T) => {
      setIsLoading(true);
      setError(null);

      try {
        await onSubmit(data);
        setIsSuccess(true);
        
        if (successMessage) {
          // Using setTimeout to ensure the toast is shown after the state updates
          setTimeout(() => {
            // Using window to avoid dependency on toast implementation
            if (typeof window !== 'undefined' && (window as any).toast) {
              (window as any).toast.success(successMessage);
            }
          }, 0);
        }
        
        onSuccess?.(data);
      } catch (err) {
        const errorMessage = 
          (err as Error)?.message || 
          errorMessage || 
          'An error occurred. Please try again.';
        
        setError(errorMessage);
        
        if (errorMessage) {
          setTimeout(() => {
            if (typeof window !== 'undefined' && (window as any).toast) {
              (window as any).toast.error(errorMessage);
            }
          }, 0);
        }
        
        onError?.(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [onSubmit, onSuccess, onError, successMessage, errorMessage]
  );

  const submitHandler = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      return handleSubmit(handleFormSubmit)(e);
    },
    [handleSubmit, handleFormSubmit]
  );

  return [
    submitHandler,
    {
      isLoading,
      isSuccess,
      error,
      reset,
    },
  ];
}

export default useFormSubmit;
