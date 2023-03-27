import { ValidationChain, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { tokenList } from '../controllers/User';

export const validate = (schemas: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(schemas.map(schema => schema.run(req)));

    const result = validationResult(req);
    if (result.isEmpty()) {
      return next();
    }

    const errors = result.array();
    return res.status(400).send(errors);
  };
};

export interface MRequest extends Request {
  user: {
    id: string;
  };
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];
  const refreshToken = req.headers['x-access-token'] as string;
  const errors = {
    401: {
      success: false,
      data: null,
      message: 'Unauthorized',
    },
  };

  if (!refreshToken || !accessToken) {
    return res.status(401).json(errors['401']);
  }
  try {
    if (accessToken) {
      const accessTokenPayload = jwt.verify(accessToken, process.env.JWT_SECRET as string) as {
        id: string;
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.user = accessTokenPayload;
      return next();
    } else {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
        id: string;
      };

      const user = await User.findById(decoded.id);
      if (!user || !tokenList.has(refreshToken)) return res.status(401).json(errors['401']);

      const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
      });

      res.setHeader('Authorization', `Bearer ${newAccessToken}`);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.user = decoded;
      return next();
    }
  } catch (err) {
    return res.status(401).json(errors['401']);
  }
};

class GeneralError extends Error {
  constructor(message = 'Something went wrong') {
    super();
    this.message = message;
  }
  getCode() {
    if (this instanceof BadRequest) {
      return 400;
    }
    if (this instanceof Unauthorized) {
      return 401;
    }
    if (this instanceof Forbidden) {
      return 403;
    }
    if (this instanceof NotFound) {
      return 404;
    }
    return 500;
  }
}
export class BadRequest extends GeneralError { }
export class NotFound extends GeneralError { }
export class Unauthorized extends GeneralError { }
export class Forbidden extends GeneralError { }

export const errorMiddleware = (
  err: GeneralError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // console.log(err);
  if (err instanceof GeneralError) {
    return res.status(err.getCode()).json({
      status: false,
      data: null,
      message: err.message,
    });
  }
  return res.status(500).json({
    status: false,
    data: null,
    message: err.name === 'JsonWebTokenError' ? 'Unauthorized Access' : err.message,
  });
};
