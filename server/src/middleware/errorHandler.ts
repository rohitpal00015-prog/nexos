import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Nexora Error Middleware]', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Request validation failed',
        details: err.errors
      }
    });
    return;
  }

  res.status(500).json({
    success: false,
    data: null,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected internal error occurred'
    }
  });
}
