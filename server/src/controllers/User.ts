import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { body, param } from 'express-validator';
import User, { UserType } from '../models/User';

type TokenPayload = {
  status: string;
  token: string;
  refreshToken: string;
};

const tokenList = new Map<string, TokenPayload>();
export const getUsers = (_: Request, res: Response) => {
  User.find()
    .then(users => {
      return res.json({
        success: true,
        data: users,
        error: null,
      });
    })
    .catch(err => {
      return res.status(500).json({
        success: false,
        data: null,
        error: err,
      });
    });
};

export const getUser = (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      data: null,
      // eslint-disable-next-line sonarjs/no-duplicate-string
      error: 'Bad Request. Id is required.',
    });
  }
  User.findById(id)
    .then(user => {
      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          error: 'User not found.',
        });
      }
      return res.json({
        success: true,
        data: {
          name: user.name,
          email: user.email,
          role: user.role,
          gender: user.gender,
          age: user.age,
        },
        error: null,
      });
    })
    .catch(err => {
      return res.status(500).json({
        success: false,
        data: null,
        error: err,
      });
    });
};

export const createUser = (req: Request, res: Response) => {
  const { name, email, password, age, gender, role } = req.body as UserType;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Bad Request. Name, email and password are required.',
    });
  }
  User.findOne({ email }).then(async user => {
    if (user) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'User already exists. Please provide a different email.',
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      role,
    });
    newUser
      .save()
      .then(userLocal => {
        return res.status(201).json({
          success: true,
          data: userLocal._id,
          error: null,
        });
      })
      .catch(err => {
        return res.status(500).json({
          success: false,
          data: null,
          error: err,
        });
      });
  });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Bad Request. Id is required.',
    });
  }
  const { name, email, password, age, gender, role } = req.body as UserType;
  try {
    const { token } = req.body as TokenPayload;
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    if (decoded.id !== id) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Unauthorized',
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'User not found.',
      });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (role) user.role = role;

    await user.save();

    return res.json({
      success: true,
      data: user._id,
      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      error: err?.name === 'JsonWebTokenError' ? 'Unauthorized' : err,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Bad Request. Id is required.',
      });
    }
    const { token } = req.body as TokenPayload;
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    if (decoded.id !== id) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Unauthorized',
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'User not found. Cannot delete.',
      });
    }
    await user.remove();
    return res.json({
      success: true,
      data: `User with id ${id} has been deleted.`,
      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      error: err,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body as UserType;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Bad Request. Email and password are required.',
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'User or password is incorrect.',
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'User or password is incorrect.',
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response: TokenPayload = {
      status: 'Logged In',
      token,
      refreshToken,
    };
    tokenList.set(refreshToken, response);
    return res.json({
      success: true,
      data: response,
      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      error: err,
    });
  }
};

export const tokenRefresh = async (req: Request, res: Response) => {
  // const refreshToken = req.headers['x-access-token'] as string;
  const refreshToken = req.body.refreshToken as string;
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Bad Request. Refresh token is required.',
    });
  }
  try {
    const token = tokenList.get(refreshToken);
    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Refresh token is invalid.',
      });
    }
    const decoded = jwt.verify(token.token, process.env.JWT_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Refresh token is invalid.',
      });
    }
    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
    });
    const response: TokenPayload = {
      status: 'Logged In',
      token: newToken,
      refreshToken,
    };
    tokenList.set(refreshToken, response);
    return res.json({
      success: true,
      data: response,
      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      error: err,
    });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  // const refreshToken = req.headers['x-access-token'] as string;
  const refreshToken = req.body.refreshToken as string;
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Bad Request. Refresh token is required.',
    });
  }
  try {
    const token = tokenList.get(refreshToken);
    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Refresh token is invalid.',
      });
    }
    tokenList.delete(refreshToken);
    return res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      error: err,
    });
  }
};

const emailRequired = 'Email is required.';

export const createUserValidationSchema = [
  body('name')
    .notEmpty()
    .trim()
    // space should only occur once
    .matches(/^[a-zA-Z ]{2,30}$/)
    .isLength({ min: 2, max: 30 })
    .withMessage('Name is required. And Should be between 2-24 characters.'),
  body('email').isEmail().withMessage(emailRequired),
  body('password')
    .isLength({ min: 6 })
    .isStrongPassword()
    .withMessage('Password is required. And Should be between 6-24 characters. Strong Password.'),
  body('age')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Age is required. And Should be a number.'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender is required. And Should be male or female or other.'),
  body('role')
    .optional()
    .isIn(['developer', 'admin', 'project_manager', 'client'])
    .withMessage('Role is required. And Should be admin or user.'),
];

export const updateUserValidationSchema = [
  param('id').isMongoId().withMessage('Id is required.').bail(),
  body('name')
    .optional()
    .isAlpha('en-IN')
    .isLength({ min: 2, max: 24 })
    .withMessage('Name is required. And Should be between 2-24 characters.'),
  body('email').optional().isEmail().withMessage(emailRequired),
  body('password')
    .optional()
    .isLength({ min: 6, max: 24 })
    .isStrongPassword()
    .withMessage('Password is required. And Should be between 6-24 characters. Strong Password.'),
  body('age')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Age is required. And Should be a number.'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender is required. And Should be male or female or other.'),
  body('role')
    .optional()
    .isIn(['developer', 'admin', 'project_manager', 'client'])
    .withMessage('Role is required. And Should be admin or user.'),
];
export const deleteUserValidationSchema = [
  param('id').isMongoId().withMessage('Id is required.').bail(),
];

export const loginUserValidationSchema = [
  body('email').isEmail().withMessage(emailRequired),
  body('password')
    .isLength({ min: 6 })
    .isStrongPassword()
    .withMessage('Password is required. And Should be between 6-24 characters.'),
];

export const refreshTokenValidationSchema = [
  body('refreshToken').isString().withMessage('Refresh token is required.').bail(),
];
