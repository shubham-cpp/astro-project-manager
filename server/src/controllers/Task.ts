import { Request, Response } from 'express';
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
