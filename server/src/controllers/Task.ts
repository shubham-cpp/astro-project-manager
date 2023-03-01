import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
// import jwt from 'jsonwebtoken';
import Task from '../models/Task';

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
  const { title, days, description, type, project, refreshToken } = req.body;
  if(!refreshToken) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Bad Request. Refresh token is required.',
    });
  }
  const user = await Task.findOne({ refreshToken });
  if(!user) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Bad Request. Refresh token is invalid.',
    });
  }
  
}