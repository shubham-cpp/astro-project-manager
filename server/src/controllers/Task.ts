import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import Task from '../models/Task';
import User from '../models/User';
import jwt from 'jsonwebtoken';

export const getTasks = async (req: Request, res: Response) => {
  try{
    const tasks = await Task.find()
    res.status(200).json(tasks)
  }catch(err){
    res.status(500).json(err)
  }
};

export const getTask = async (req: Request, res: Response) => {
  try{
  const id = req.params.id;
  const {refreshToken} = req.body;
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {id: string};
  const user = await User.findById(decoded.id);
    if(!user){
      return res.json({
        success: false,
        data: null,
        error: 'Unauthrized',
      })
    }
    const task = await Task.findById(id)
    if(!task){
      return res.json({
        success: false,
        date: null,
        error: `Task with id ${id} not found`,
      })
    }
    return res.json({
      success: true,
      data: task,
      error: null,
    });
  }catch(err){
      return res.status(500).json({
        success: false,
        data: null,
        error: err,
      });
    }
}

export const createTask = async (req: Request, res: Response) => {
  const { title, daysAllocated, daysRemaining, description, type, projectId, refreshToken} = req.body;
  try{
    if(!refreshToken) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Bad Request. Refresh token is required.',
      });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Refresh token is invalid.',
      })
    }
    const taskWithSameTitleInProjectExists = await Task.findOne({title: title, projectId: projectId})
    if(taskWithSameTitleInProjectExists) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Task with same title in project already exists.',
      })
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
    })
    await newTask.save();
    return res.json({
      success: true,
      data: newTask,
      error: null,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      error: err,
    });
  }
}

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const {refreshToken} = req.body;
    if(!refreshToken) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Bad Request. Refresh token is required.',
      });
    }
    if(refreshToken){
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };
      const user = await User.findById(decoded.id);
      if(!user) {
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Bad Request. Refresh token is invalid.',
        });
      }
    }
    const task = await Task.findById(id);
    if(!task) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Bad Request. Task does not exist.',
      });
    }
    await Task.findOneAndDelete({ _id: id })
    return res.json({
      message: 'Task deleted successfully',
      success: true,
      data: task,
      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      error: err,
    });
  }
}

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, daysAllocated, daysRemaining, description, type, projectId, refreshToken } = req.body;
  try {
    if(!refreshToken){
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Bad Request. Refresh token is required.',
      })
    }
    if(refreshToken){
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };
      const user = await User.findById(decoded.id);
      if(!user) {
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Bad Request. Refresh token is invalid.',
        });
      }
    }
    const task = await Task.findByIdAndUpdate(id, {
      title,
      daysAllocated,
      daysRemaining,
      description,
      type,
      projectId,
    })
    return res.json({
      message: 'Task updated successfully',
      success: true,
      data: task,
      error: null,
    })
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      error: err,
    });
  }
}
// condition for daysRemaining to be always greater than daysAllocated.

export const creaeTaskValidationSchema = [
  body('createdBy').isMongoId().withMessage('Created by (User) is required').bail(),
  body('title')
    .notEmpty()
    .matches(/^[a-zA-Z]{3,}\s?[a-zA-Z0-9 ]+$/)
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('daysAllocated').optional().isDate().withMessage('Days allocated must be a date'),
  body('daysRemaining').optional().isDate().withMessage('Days remaining must be a date').custom((daysRemaining, {req}) => {
    const daysAllocated = req.body.daysAllocated;
    if(!daysAllocated || !daysRemaining){
      return true // don't validate if any value is missing
    }
    return daysRemaining > daysAllocated;
  }).withMessage('Days remaining must be greater than days allocated'),
  body('description').isLength({min: 2, max: 100} ).optional().notEmpty().withMessage('Description is required'),
  body('currentOwner').notEmpty().isMongoId().withMessage('Current owner is required'),
  body('projectId').notEmpty().isAlphanumeric().withMessage('Project Id is required'),
  body('status').optional().isIn(['red', 'orange', 'green']).withMessage('Status must be red, orange, green'),
  body('type').isIn(['bug', 'task', 'story', 'epic']).withMessage('Type must be bug, task, story, epic'),
]

export const getTaskValidaionSchema = [
  param('id').isMongoId().withMessage('Id is required').bail(),
  body('refreshToken').isString().withMessage('Refresh token is required').bail(),
]

export const updateTaskValidationSchema = [
  param('id').isMongoId().withMessage('Id is required').bail(),
  body('refreshToken').isString().withMessage('Refresh token is required').bail(),
  body('title')
    .optional()
    .matches(/^[a-zA-Z]{3,}\s?[a-zA-Z0-9 ]+$/)
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('daysAllocated').optional().isDate().withMessage('Days allocated must be a date'),
  body('daysRemaining').optional().isDate().withMessage('Days remaining must be a date').custom((daysRemaining, {req}) => {
    const daysAllocated = req.body.daysAllocated;
    if(!daysAllocated || !daysRemaining){
      return true // don't validate if any value is missing
    }
    return daysRemaining > daysAllocated;
  }).withMessage('Days remaining must be greater than days allocated'),
  body('description').optional().isLength({min: 2, max: 100} ).notEmpty().withMessage('Description is required'),
  body('currentOwner').optional().isMongoId().withMessage('Current owner is required'),
  body('projectId').optional().isAlphanumeric().withMessage('Project Id is required'),
  body('status').optional().isIn(['red', 'orange', 'green']).withMessage('Status must be red, orange, green'), 
  body('type').optional().isIn(['bug', 'task', 'story', 'epic']).withMessage('Type must be bug, task, story, epic'),
]

export const deleteTaskValidationSchema = [
  param('id').isMongoId().withMessage('Id is required').bail(),
  body('refreshToken').isString().withMessage('Refresh token is required').bail(),
]
