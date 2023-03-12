import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
// import jwt from 'jsonwebtoken';
import Task from '../models/Task';
import User from '../models/User';

export const getTasks = async (req: Request, res: Response) => {
  Task.find()
    .then(
      tasks => {
        return res.json({
          success: true,
          data: tasks,
          error: null,
        });
      }
    ).catch(err => {
      return res.status(500).json({
        success: false,
        data: null,
        error: err,
      });
    });
};

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
    const user = await User.findOne({ refreshToken });
    if(!user) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Bad Request. Refresh token is invalid.',
      });
    }
    const task = await Task.findOne({ title, projectId });
    if(task) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Bad Request. Task with this title already exists.',
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
      refreshToken,
    })
    await newTask.save()
    return res.status(201).json({
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
      const user = await User.findOne({ refreshToken });
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
      const user = await User.findOne({ refreshToken });
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
      refreshToken,
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