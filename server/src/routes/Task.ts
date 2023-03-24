import { Router } from 'express';
import { getTasks, createTask, deleteTask, updateTask, getTask, creaeTaskValidationSchema, getTaskValidaionSchema, deleteTaskValidationSchema, updateTaskValidationSchema} from '../controllers/Task';
import { validate } from '../util';

const taskRouter = Router();

taskRouter
    .get('/', getTasks)
    .post('/', validate(creaeTaskValidationSchema), createTask)
    .get('/:id', validate(getTaskValidaionSchema) ,getTask)
    .delete('/:id', validate(deleteTaskValidationSchema) ,deleteTask)
    .patch('/:id', validate(updateTaskValidationSchema) ,updateTask)

export default taskRouter;
