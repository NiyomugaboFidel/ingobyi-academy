import { ApiError } from './client';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data.',
  422: 'Some fields are invalid. Please review and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our servers. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again.',
  503: 'The service is temporarily unavailable. Please try again.',
};

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isApiError(err)) {
    if (err.message && err.message !== `Request failed (${err.statusCode})`) {
      return err.message;
    }
    return STATUS_MESSAGES[err.statusCode] ?? fallback;
  }

  if (err instanceof TypeError && /fetch|network/i.test(err.message)) {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}

export function shouldRetryRequest(err: unknown): boolean {
  if (!isApiError(err)) return true;
  return err.statusCode >= 500 || err.statusCode === 408;
}
