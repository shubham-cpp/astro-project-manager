/* eslint-disable sonarjs/no-duplicate-string */
import bcrypt from 'bcrypt';
import type { NextFunction, Request, Response } from 'express';
import { body, param } from 'express-validator';
import jwt from 'jsonwebtoken';
import Project from '../models/Project';
import Task from '../models/Task';
import User, { UserType } from '../models/User';
import { BadRequest, NotFound, Unauthorized } from '../utils';

type TokenPayload = {
  status: string;
  token: string;
  refreshToken: string;
};

export const tokenList = new Map<string, TokenPayload>();
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

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    if (!id) {
      throw new BadRequest('ID is required');
    }
    const user = await User.findById(id, 'name email role gender age');

    if (!user) {
      throw new NotFound(`User with id ${id} not found`);
    }
    return res.json({
      success: true,
      data: user,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const userBody = req.body as UserType;
  const { name, email, password, age, role, gender } = userBody;
  try {
    if (!name || !email || !password) {
      throw new BadRequest('Name, email and password are required');
    }
    const user = await User.findOne({ email });
    if (user) {
      throw new BadRequest('User already exists. Please provide a different email.');
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
    const userCreated = await newUser.save();
    return res.status(201).json({
      success: true,
      data: userCreated._id,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    if (!id) {
      throw new BadRequest('Bad Request. Id is required.');
    }
    const { name, email, password, age, gender, role } = req.body as UserType;
    const user = await User.findById(id);
    if (!user) {
      throw new NotFound('User not found.');
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (role) user.role = role;
    // for (const key in user){
    //   if (Object.prototype.hasOwnProperty.call(user,key)) {
    //     user[key] = userBody[key];
    //   }
    // }

    await user.save();

    return res.json({
      success: true,
      data: user._id,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    if (!id) throw new BadRequest('Bad Request. Id is required.');

    const user = await User.findById(id);
    if (!user) throw new NotFound('User not found. Cannot perform delete');

    const tasks = await Task.findOne({ currentOwner: user._id });
    if (tasks) throw new BadRequest('User cannot be deleted since User currently owns task(s).');

    const project = await Project.findOne({ projectOwner: user._id });
    if (project)
      throw new BadRequest('User cannot be deleted since User currently owns project(s).');

    await user.remove();
    await Project.findOneAndUpdate({ members: { $in: [id] } }, { $pull: { members: id } });
    return res.json({
      success: true,
      data: `User with id ${id} has been deleted.`,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as UserType;
  try {
    if (!email || !password) {
      throw new BadRequest('Bad Request. Email and password are required.');
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFound('User or password is incorrect.');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Unauthorized('User or password is incorrect.');
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const maxAge = 60 * 60 * 24 * 70;
    res.setHeader(
      'Set-Cookie',
      `refreshToken=${refreshToken}; Max-Age=${maxAge};path=/; Secure; HttpOnly`,
    );

    const response: TokenPayload = {
      status: 'Logged In',
      token,
      refreshToken,
    };
    tokenList.set(refreshToken, response);
    return res.json({
      success: true,
      data: {
        status: 'Logged In',
        token,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

export const tokenRefresh = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.headers['x-access-token'] as string;
  try {
    if (!refreshToken) {
      throw new BadRequest('Bad Request. Refresh token is required.');
    }
    const token = tokenList.get(refreshToken);
    if (!token) {
      throw new Unauthorized('Refresh token is invalid.');
    }
    const decoded = jwt.verify(token.token, process.env.JWT_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Unauthorized('Refresh token is invalid.');
    }
    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
    });

    res.setHeader('Authorization', `Bearer ${newToken}`);

    const maxAge = 60 * 60 * 24 * 70;
    res.setHeader(
      'Set-Cookie',
      `refreshToken=${refreshToken}; Max-Age=${maxAge};path=/; Secure; HttpOnly`,
    );
    const response: TokenPayload = {
      status: 'Logged In',
      token: newToken,
      refreshToken,
    };
    tokenList.set(refreshToken, response);
    return res.json({
      success: true,
      data: {
        status: 'Logged In',
        token: newToken,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.headers['x-access-token'] as string;
  try {
    if (!refreshToken) {
      throw new Unauthorized('Refresh token is invalid.');
    }
    const token = tokenList.get(refreshToken);
    if (!token) {
      throw new Unauthorized('Refresh token is invalid.');
    }
    tokenList.delete(refreshToken);
    return res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// TODO user/task/:id all task for user owned or assigned
export const getUserTasks = async (req: Request, res: Response, next: NextFunction) => {
  const { id: userId } = req.params;
  const token = req.headers['authorization']?.split(' ')[1];
  try {
    if (!token) {
      throw Error('Bad Request. Token is required.');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Unauthorized('Token is invalid.');
    }

    if (!user._id.equals(userId)) {
      throw new Unauthorized('Token is invalid.');
    }
    const tasks = await Task.find({ createdBy: user && userId, currentOwner: user && userId });
    return res.json({
      success: true,
      data: tasks,
      error: null,
      totalTasks: tasks.length,
    });
  } catch (err) {
    next(err);
  }
};

const emailRequired = 'Email is required.';

export const createUserValidationSchema = [
  body('name')
    .notEmpty()
    .matches(/^[a-zA-Z]{2,}\s?[a-zA-Z0-9 ]+$/)
    .isLength({ min: 2, max: 30 })
    .withMessage('Name is required. And Should be between 2-24 characters.'),
  body('email').isEmail().withMessage(emailRequired),
  body('password')
    .isLength({ min: 6 })
    .isStrongPassword()
    .withMessage('Password is required. And Should be between 6-24 characters. Strong Password.'),
  body('age')
    .optional()
    .isInt({ min: 13, max: 100 })
    .withMessage('Age is required. And Should be a number. Minimum 13 and maximum 120.'),
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
export const userIdValidationSchema = [
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

export const getUserTaskValidationSchema = [
  param('id').isMongoId().withMessage('Id is required.').bail(),
  body('refreshToken').isString().withMessage('Refresh token is required.').bail(),
];
