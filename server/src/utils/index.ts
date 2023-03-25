import { ValidationChain, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const validate = (schemas: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(schemas.map(schema => schema.run(req)));

    const result = validationResult(req);
    if (result.isEmpty()) {
      return next();
    }

    const errors = result.array();
    return res.send(errors);
  };
};

export interface MRequest extends Request {
  user: {
    id: string;
  };
}

export const authenticateToken = async (req: MRequest, res: Response, next: NextFunction) => {
  const refreshToken =
    req.body.token || req.query.token || (req.headers['x-access-token'] as string);
  if (!refreshToken) {
    return res.status(401).send('Unauthorized');
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
      id: string;
    };
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).send('Unauthorized');
  }
};
