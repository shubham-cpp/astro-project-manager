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
  const { title, daysAllocated, daysRemaining, description, type, project, refreshToken} = req.body;
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
    Task.findOne({ title }).then(async task => {
      if(task){
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Bad Request. Task with similar title already exists.',  
        })
      }
      const newTask = new Task({
        title,
        daysAllocated,
        daysRemaining,
        description,
        type,
        project,
        createdBy: user._id,
        currentOwner: user._id,
        refreshToken,
      })
      newTask.save()
        .then(
          task => {
            return res.json({
              success: true,
              data: task,
              error: null,
            });
          }
        )
        .catch(err => {
          return res.status(500).json({
            success: false,
            data: null,
            error: err,
          });
        })
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
    const task = await Task.findById(id);
    if(!task) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Bad Request. Task does not exist.',
      });
    }
    Task.findOneAndDelete({ _id: id })
      .then(
        task => {
          return res.json({
            message: 'Task deleted successfully',
            success: true,
            data: task,
            error: null,
          });
        }
      )
      .catch(err => {
        return res.status(500).json({
          success: false,
          data: null,
          error: err,
        });
      });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      error: err,
    });
  }
}
// TODO get /update/ delete single task - 
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
    Task.findByIdAndUpdate(id, { title, daysAllocated, daysRemaining, description, type, projectId }, { new: true })
      .then(
        task => {
          return res.json({
            message: 'Task updated successfully',
            success: true,
            data: task,
            error: null,
          });
        }
      )
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      error: err,
    });
  }
}