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
import { validate } from '../utils';

const taskRouter = Router();

taskRouter
  .get('/', getTasks)
  .post('/', validate(createTaskValidationSchema), createTask)
  .get('/:id', validate(getTaskValidaionSchema), getTask)
  .delete('/:id', validate(deleteTaskValidationSchema), deleteTask)
  .patch('/:id', validate(updateTaskValidationSchema), updateTask);

export default taskRouter;
