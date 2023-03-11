import { Router } from 'express';
import { getTasks, createTask, deleteTask, updateTask} from '../controllers/Task';

const taskRouter = Router();

taskRouter
    .get('/', getTasks)
    .post('/', createTask)
    .delete('/:id', deleteTask)
    .patch('/:id', updateTask)

export default taskRouter;
