import { Router } from 'express';
import { getTasks, createTask, deleteTask, updateTask, getTask} from '../controllers/Task';

const taskRouter = Router();

taskRouter
    .get('/', getTasks)
    .post('/', createTask)
    .get('/:id', getTask)
    .delete('/:id', deleteTask)
    .patch('/:id', updateTask)

export default taskRouter;
