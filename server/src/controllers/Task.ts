/* eslint-disable sonarjs/no-duplicate-string */
import { NextFunction, Request, Response } from 'express';
import { body, param } from 'express-validator';
import jwt from 'jsonwebtoken';
import Project from '../models/Project';
import Task, { statusTypes, TaskType, taskTypes } from '../models/Task';
import User from '../models/User';
import { BadRequest, NotFound, Unauthorized } from '../utils';

export const getTasks = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const refreshToken = req.headers['x-access-token'] as string;
    if (!refreshToken) {
      throw new BadRequest('Refresh token is required');
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
      id: string;
    };
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Unauthorized('Token is invalid.');
    }
    const task = await Task.findById(id);
    if (!task) {
      throw new NotFound(`Task with id ${id} not found`);
    }
    return res.json({
      success: true,
      data: task,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  const { title, daysAllocated, daysRemaining, description, type, projectId } = req.body;
  const refreshToken = req.headers['x-access-token'] as string;
  try {
    if (!refreshToken) {
      throw new BadRequest('Refresh token is required');
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
      id: string;
    };
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new BadRequest('Refresh token is required');
    }
    const taskWithSameTitleInProjectExists = await Task.findOne({
      title,
      projectId,
    });
    if (taskWithSameTitleInProjectExists) {
      throw new BadRequest(`Task with title ${title} already exists in project ${projectId}`);
    }
    const newTask = new Task({
      title,
      daysAllocated,
      daysRemaining,
      description,
      type,
      projectId,
      createdBy: user._id,
      currentOwner: user._id,
    });
    await newTask.save();
    await Project.findOneAndUpdate(
      { projectId },
      {
        $push: {
          tasks: newTask._id,
        },
      },
    );
    return res.json({
      success: true,
      data: newTask,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const refreshToken = req.headers['x-access-token'] as string;
    if (!refreshToken) {
      throw new BadRequest('Refresh token is required');
    }
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
        id: string;
      };
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new NotFound('No User Found. Please logout and login again.');
      }
    }
    const task = await Task.findById(id);
    if (!task) {
      throw new NotFound(`Task with id ${id} not found`);
    }
    const { projectId } = task;

    await task.remove();
    await Project.findOneAndUpdate({ projectId }, { $pull: { tasks: id } });

    return res.json({
      success: true,
      data: task,
      message: 'Task deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, daysAllocated, daysRemaining, description, type, projectId } =
    req.body as TaskType;

  const refreshToken = req.headers['x-access-token'] as string;
  try {
    if (!refreshToken) {
      throw new BadRequest('Refresh token is required');
    }
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
        id: string;
      };
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new NotFound('No User Found. Please logout and login again.');
      }
    }
    const task = await Task.findById(id);

    if (!task) throw new NotFound(`Task with id ${id} not found`);

    if (title.trim().length) task.title = title.trim();
    if (description.trim().length) task.description = description.trim();
    if (daysAllocated) task.daysAllocated = daysAllocated;
    if (daysRemaining) task.daysRemaining = daysRemaining;
    if (type) task.type = type;
    if (projectId) task.projectId = projectId;

    await task.save();

    return res.json({
      success: true,
      data: task,
      message: 'Task updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

// condition for daysRemaining to be always greater than daysAllocated.
export const createTaskValidationSchema = [
  body('createdBy').isMongoId().withMessage('Created by (User) is required').bail(),
  body('title')
    .notEmpty()
    .matches(/^[a-zA-Z]{3,}\s?[a-zA-Z0-9 ]+$/)
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('daysAllocated').optional().isDate().withMessage('Days allocated must be a date'),
  body('daysRemaining')
    .optional()
    .isDate()
    .withMessage('Days remaining must be a date')
    .custom((daysRemaining, { req }) => {
      const { daysAllocated } = req.body;
      if (!daysAllocated || !daysRemaining) {
        return true; // don't validate if any value is missing
      }
      return daysRemaining > daysAllocated;
    })
    .withMessage('Days remaining must be greater than days allocated'),
  body('description')
    .isLength({ min: 2, max: 100 })
    .optional()
    .notEmpty()
    .withMessage('Description is required'),
  body('currentOwner').notEmpty().isMongoId().withMessage('Current owner is required'),
  body('projectId').notEmpty().isAlphanumeric().withMessage('Project Id is required'),
  body('status')
    .optional()
    .isIn(statusTypes)
    .withMessage(`Status must be ${statusTypes.join(', ')}`),
  body('type')
    .isIn(taskTypes)
    .withMessage(`Type must be ${taskTypes.join(', ')}`),
];

export const getTaskValidaionSchema = [
  param('id').isMongoId().withMessage('Id is required').bail(),
];

export const updateTaskValidationSchema = [
  param('id').isMongoId().withMessage('Id is required').bail(),
  body('title')
    .optional()
    .matches(/^[a-zA-Z]{3,}\s?[a-zA-Z0-9 ]+$/)
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('daysAllocated').optional().isDate().withMessage('Days allocated must be a date'),
  body('daysRemaining')
    .optional()
    .isDate()
    .withMessage('Days remaining must be a date')
    .custom((daysRemaining, { req }) => {
      const { daysAllocated } = req.body;
      if (!daysAllocated || !daysRemaining) {
        return true; // don't validate if any value is missing
      }
      return daysRemaining > daysAllocated;
    })
    .withMessage('Days remaining must be greater than days allocated'),
  body('description')
    .optional()
    .isLength({ min: 2, max: 100 })
    .notEmpty()
    .withMessage('Description is required'),
  body('currentOwner').optional().isMongoId().withMessage('Current owner is required'),
  body('projectId').optional().isAlphanumeric().withMessage('Project Id is required'),
  body('status')
    .optional()
    .isIn(statusTypes)
    .withMessage(`Status must be ${statusTypes.join(', ')}`),
  body('type')
    .optional()
    .isIn(taskTypes)
    .withMessage(`Type must be ${taskTypes.join(', ')}`),
];

export const deleteTaskValidationSchema = [
  param('id').isMongoId().withMessage('Id is required').bail(),
];
