import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    _req: Request,
    _res: Response,
    _next: NextFunction
) => {
    console.error('Error:', err);

    // For now, just log the error
    // In a real application, you'd want to send a response
    console.error('Unhandled error:', err.message);
}; 