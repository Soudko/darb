import type { ApiError, ErrorCode } from '../shared/types';

// An error we choose to show the screens. The message is always safe to send.
export class HttpError extends Error {
  constructor(public status: number, public code: ErrorCode, message: string) {
    super(message);
  }
}

export function errorBody(code: ErrorCode, message: string): ApiError {
  return { error: { code, message } };
}
