import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { BadRequestError } from '../../shared/error/app-error';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Validates and coerces a request part against a zod schema before the controller runs.
 * On success, req[part] is replaced with the parsed (typed, coerced, defaulted) data,
 * so controllers can trust their input shape instead of re-checking it.
 */
export const validate = (schema: ZodType, part: RequestPart = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const field = firstIssue.path.join('.') || part;
      next(new BadRequestError(
        `Invalid ${part}: ${field} — ${firstIssue.message}`,
        'Please check your input and try again.',
      ));
      return;
    }

    (req[part] as unknown) = result.data;
    next();
  };
};
