import { Router } from 'express';
import {
  createTask,
  createTaskValidationSchema,
  deleteTask,
  deleteTaskValidationSchema,
  getTask,
  getTasks,
  getTaskValidaionSchema,
  updateTask,
  updateTaskValidationSchema,
} from '../controllers/Task';
import { authenticateToken, validate } from '../utils';

const taskRouter = Router();

taskRouter
  .get('/', authenticateToken, getTasks)
  .post('/', authenticateToken, validate(createTaskValidationSchema), createTask)
  .get('/:id', authenticateToken, validate(getTaskValidaionSchema), getTask)
  .delete('/:id', authenticateToken, validate(deleteTaskValidationSchema), deleteTask)
  .patch('/:id', authenticateToken, validate(updateTaskValidationSchema), updateTask);

export default taskRouter;
