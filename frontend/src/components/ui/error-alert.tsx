/**
 * ErrorAlert Component
 * 
 * A reusable error alert component for displaying error messages.
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  title?: string;
  message?: string;
  error?: Error | unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  title = 'Error',
  message,
  error,
  onRetry,
  className,
}: ErrorAlertProps) {
  // Extract error message
  const errorMessage = message || (error instanceof Error ? error.message : 'An unexpected error occurred');

  return (
    <Alert variant="destructive" className={cn('my-4', className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm">{errorMessage}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-3"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

export function ErrorPage({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this page.',
  onRetry,
}: ErrorAlertProps) {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorAlert
          title={title}
          message={message}
          onRetry={onRetry}
        />
      </div>
    </div>
  );
}

export function InlineError({
  message,
  onRetry,
  className,
}: ErrorAlertProps) {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <ErrorAlert
        message={message}
        onRetry={onRetry}
        className="max-w-md"
      />
    </div>
  );
}
